"""
Синхронизатор каталога: тянет товары, атрибуты, цены и остатки из Ozon Seller API
(только read-методы) и сохраняет/обновляет карточки в PostgreSQL.

Уважает флаг manual_override: если карточку отредактировали в админке,
контентные поля (name/description/brand/category_name/images) больше не перезаписываются
синхронизатором. Цена/остатки/статус модерации/is_archived обновляются всегда.

Использует библиотеку ozonapi-async (https://github.com/a-ulianov/OzonAPI).
pip install ozonapi-async
"""
import asyncio
import logging
import os
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from ozonapi import SellerAPI, SellerAPIConfig
from ozonapi.seller.schemas.products import (
    ProductListRequest,
    ProductInfoListRequest,
    ProductInfoAttributesRequest,
)

from database import SessionLocal, init_db
from models import Part, PartImage, PartAttribute, PartStock, SyncLog

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("sync_ozon")

BATCH_SIZE = 100


def _now():
    return datetime.now(timezone.utc)


def _to_decimal(value):
    if value in (None, ""):
        return None
    try:
        return Decimal(str(value))
    except InvalidOperation:
        return None


async def fetch_all_offer_ids(api: SellerAPI):
    offer_ids = []
    last_id = ""
    while True:
        request = ProductListRequest(limit=1000, last_id=last_id)
        response = await api.product_list(request)
        items = response.result.items
        if not items:
            break
        offer_ids.extend(item.offer_id for item in items if item.offer_id)
        last_id = response.result.last_id
        if not last_id or len(items) < 1000:
            break
    logger.info("Собрано offer_id: %d", len(offer_ids))
    return offer_ids


async def fetch_product_details(api: SellerAPI, offer_ids):
    all_items = []
    for i in range(0, len(offer_ids), BATCH_SIZE):
        batch = offer_ids[i:i + BATCH_SIZE]
        request = ProductInfoListRequest(offer_id=batch)
        response = await api.product_info_list(request)
        all_items.extend(response.items)
        logger.info("Обработан батч %d-%d из %d", i, i + len(batch), len(offer_ids))
    return all_items


async def fetch_attributes(api: SellerAPI, offer_ids):
    attributes_by_offer = {}
    for i in range(0, len(offer_ids), BATCH_SIZE):
        batch = offer_ids[i:i + BATCH_SIZE]
        request = ProductInfoAttributesRequest(
            filter={"offer_id": batch},
            limit=len(batch),
        )
        response = await api.product_info_attributes(request)
        for item in response.result:
            attributes_by_offer[item.offer_id] = item.attributes
    return attributes_by_offer


def upsert_part(db, item, attributes):
    """Создаёт/обновляет карточку. Контентные поля не трогаются при manual_override=True."""
    part = db.query(Part).filter_by(ozon_product_id=item.id).one_or_none()
    if part is None:
        part = Part(ozon_product_id=item.id)
        db.add(part)

    part.offer_id = item.offer_id
    part.ozon_sku = getattr(item, "sku", None)
    part.price = _to_decimal(getattr(item, "price", None))
    part.old_price = _to_decimal(getattr(item, "old_price", None))
    part.currency_code = getattr(item, "currency_code", "RUB") or "RUB"

    statuses = getattr(item, "statuses", None)
    if statuses is not None:
        part.moderate_status = getattr(statuses, "moderate_status", None)
    part.is_archived = bool(getattr(item, "archived", False))

    stocks_obj = getattr(item, "stocks", None)
    if part.id:
        db.query(PartStock).filter_by(part_id=part.id).delete()
    if stocks_obj is not None:
        part.has_stock = bool(getattr(stocks_obj, "has_stock", False))
    part.last_synced_at = _now()

    if not part.manual_override:
        part.name = getattr(item, "name", None) or part.offer_id
        part.barcode = getattr(item, "barcode", None)
        part.category_id = getattr(item, "description_category_id", None)
        part.weight = getattr(item, "weight", None)
        part.weight_unit = getattr(item, "weight_unit", None)
        part.depth = getattr(item, "depth", None)
        part.width = getattr(item, "width", None)
        part.height = getattr(item, "height", None)
        part.dimension_unit = getattr(item, "dimension_unit", None)
        part.primary_image = getattr(item, "primary_image", None)

    db.flush()

    if stocks_obj is not None:
        for s in getattr(stocks_obj, "stocks", []) or []:
            db.add(PartStock(
                part_id=part.id,
                warehouse_name=getattr(s, "source", None),
                present=getattr(s, "present", 0),
                reserved=getattr(s, "reserved", 0),
                stock_type=getattr(s, "type", None),
            ))

    if not part.manual_override:
        db.query(PartImage).filter_by(part_id=part.id).delete()
        images = getattr(item, "images", None) or []
        for order, url in enumerate(images):
            db.add(PartImage(part_id=part.id, url=url, sort_order=order,
                              is_primary=(url == part.primary_image)))

    db.query(PartAttribute).filter_by(part_id=part.id).delete()
    for attr in attributes or []:
        values = getattr(attr, "values", []) or []
        value_text = "; ".join(
            str(getattr(v, "value", "")) for v in values if getattr(v, "value", None)
        )
        db.add(PartAttribute(
            part_id=part.id,
            ozon_attribute_id=getattr(attr, "id", 0),
            value=value_text or None,
            dictionary_value_id=(
                getattr(values[0], "dictionary_value_id", None) if values else None
            ),
        ))

    return part


async def run_sync():
    client_id = os.getenv("OZON_CLIENT_ID")
    api_key = os.getenv("OZON_API_KEY")
    if not client_id or not api_key:
        raise RuntimeError("OZON_CLIENT_ID / OZON_API_KEY не заданы в окружении")

    init_db()
    db = SessionLocal()
    log_entry = SyncLog(status="running")
    db.add(log_entry)
    db.commit()

    processed = 0
    failed = 0

    try:
        config = SellerAPIConfig(client_id=client_id, api_key=api_key)
        async with SellerAPI(config=config) as api:
            offer_ids = await fetch_all_offer_ids(api)
            if not offer_ids:
                logger.warning("На аккаунте не найдено ни одного товара")

            details = await fetch_product_details(api, offer_ids)
            attributes_map = await fetch_attributes(api, offer_ids)

            for item in details:
                try:
                    upsert_part(db, item, attributes_map.get(item.offer_id, []))
                    db.commit()
                    processed += 1
                except Exception as exc:
                    db.rollback()
                    failed += 1
                    logger.exception("Ошибка при сохранении offer_id=%s: %s", item.offer_id, exc)

        log_entry.status = "success" if failed == 0 else "success_with_errors"
    except Exception as exc:
        log_entry.status = "failed"
        log_entry.error_message = str(exc)
        logger.exception("Синхронизация прервана: %s", exc)
    finally:
        log_entry.finished_at = _now()
        log_entry.products_processed = processed
        log_entry.products_failed = failed
        db.commit()
        db.close()
        logger.info("Синхронизация завершена: обработано=%d, ошибок=%d", processed, failed)


if __name__ == "__main__":
    asyncio.run(run_sync())
