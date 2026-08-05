"""
FastAPI backend каталога автозапчастей.
Публичное API для витрины + защищённые /admin/* эндпоинты для редактирования карточек.
"""
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db, init_db
from models import Part, PartImage, PartAttribute, PartStock, SyncLog, AdminAuditLog
from admin_auth import require_admin
from admin_schemas import (
    PartContentUpdate, ImageReorderRequest, AddImageByUrlRequest, RevertToSyncRequest,
)

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PUBLIC_UPLOAD_PREFIX = "/uploads"

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024


def utcnow():
    return datetime.now(timezone.utc)


app = FastAPI(title="Parts Catalog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(PUBLIC_UPLOAD_PREFIX, StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


def serialize_part_short(part: Part) -> dict:
    return {
        "id": part.id,
        "offer_id": part.offer_id,
        "name": part.name,
        "brand": part.brand,
        "price": float(part.price) if part.price is not None else None,
        "old_price": float(part.old_price) if part.old_price is not None else None,
        "currency_code": part.currency_code,
        "primary_image": part.primary_image,
        "has_stock": part.has_stock,
        "is_archived": part.is_archived,
        "manual_override": part.manual_override,
    }


def serialize_part_full(part: Part) -> dict:
    data = serialize_part_short(part)
    data.update({
        "description": part.description,
        "barcode": part.barcode,
        "category_id": part.category_id,
        "category_name": part.category_name,
        "weight": part.weight,
        "weight_unit": part.weight_unit,
        "dimensions": {
            "depth": part.depth,
            "width": part.width,
            "height": part.height,
            "unit": part.dimension_unit,
        },
        "moderate_status": part.moderate_status,
        "images": [
            {"url": img.url, "sort_order": img.sort_order, "is_primary": img.is_primary}
            for img in sorted(part.images, key=lambda x: x.sort_order)
        ],
        "attributes": [
            {"id": a.ozon_attribute_id, "value": a.value}
            for a in part.attributes if a.value
        ],
        "stocks": [
            {
                "warehouse": s.warehouse_name,
                "present": s.present,
                "reserved": s.reserved,
                "type": s.stock_type,
            }
            for s in part.stocks
        ],
        "last_synced_at": part.last_synced_at.isoformat() if part.last_synced_at else None,
        "last_edited_at": part.last_edited_at.isoformat() if part.last_edited_at else None,
    })
    return data


def get_part_or_404(db: Session, part_id: int) -> Part:
    part = db.query(Part).filter(Part.id == part_id).one_or_none()
    if part is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return part


def log_admin_action(db: Session, part_id: int, action: str, details: Optional[dict] = None):
    db.add(AdminAuditLog(part_id=part_id, action=action, details=details))


@app.get("/parts")
def list_parts(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    in_stock_only: bool = Query(False),
    include_archived: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
):
    query = db.query(Part)
    if not include_archived:
        query = query.filter(Part.is_archived.is_(False))
    if in_stock_only:
        query = query.filter(Part.has_stock.is_(True))
    if brand:
        query = query.filter(Part.brand == brand)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Part.name.ilike(like), Part.offer_id.ilike(like)))

    total = query.count()
    items = (
        query.order_by(Part.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"total": total, "page": page, "page_size": page_size,
            "items": [serialize_part_short(p) for p in items]}


@app.get("/parts/{part_id}")
def get_part(part_id: int, db: Session = Depends(get_db)):
    return serialize_part_full(get_part_or_404(db, part_id))


@app.get("/brands")
def list_brands(db: Session = Depends(get_db)):
    rows = (
        db.query(Part.brand).filter(Part.brand.isnot(None))
        .distinct().order_by(Part.brand).all()
    )
    return {"brands": [r[0] for r in rows]}


@app.get("/sync/status")
def sync_status(db: Session = Depends(get_db)):
    last = db.query(SyncLog).order_by(SyncLog.started_at.desc()).first()
    if last is None:
        return {"status": "never_run"}
    return {
        "status": last.status,
        "started_at": last.started_at.isoformat(),
        "finished_at": last.finished_at.isoformat() if last.finished_at else None,
        "products_processed": last.products_processed,
        "products_failed": last.products_failed,
        "error_message": last.error_message,
    }


@app.get("/admin/parts", dependencies=[Depends(require_admin)])
def admin_list_parts(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    only_edited: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    query = db.query(Part)
    if only_edited:
        query = query.filter(Part.manual_override.is_(True))
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Part.name.ilike(like), Part.offer_id.ilike(like)))

    total = query.count()
    items = (
        query.order_by(Part.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {"total": total, "page": page, "page_size": page_size,
            "items": [serialize_part_short(p) for p in items]}


@app.get("/admin/parts/{part_id}", dependencies=[Depends(require_admin)])
def admin_get_part(part_id: int, db: Session = Depends(get_db)):
    return serialize_part_full(get_part_or_404(db, part_id))


@app.patch("/admin/parts/{part_id}", dependencies=[Depends(require_admin)])
def admin_update_part_content(
    part_id: int, payload: PartContentUpdate, db: Session = Depends(get_db)
):
    part = get_part_or_404(db, part_id)

    changed = {}
    for field, value in payload.model_dump(exclude_unset=True).items():
        if getattr(part, field) != value:
            changed[field] = {"old": getattr(part, field), "new": value}
            setattr(part, field, value)

    if changed:
        part.manual_override = True
        part.last_edited_at = utcnow()
        log_admin_action(db, part.id, "update_content", changed)
        db.commit()
        db.refresh(part)

    return serialize_part_full(part)


@app.post("/admin/parts/{part_id}/revert-to-sync", dependencies=[Depends(require_admin)])
def admin_revert_to_sync(
    part_id: int, payload: RevertToSyncRequest, db: Session = Depends(get_db)
):
    part = get_part_or_404(db, part_id)
    part.manual_override = False
    part.last_edited_at = utcnow()
    log_admin_action(db, part.id, "revert_to_sync", {"confirm": payload.confirm})
    db.commit()
    db.refresh(part)
    return serialize_part_full(part)


@app.post("/admin/parts/{part_id}/images/upload", dependencies=[Depends(require_admin)])
async def admin_upload_image(
    part_id: int,
    file: UploadFile = File(...),
    set_as_primary: bool = Query(False),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Разрешены только JPEG, PNG, WEBP")

    part = get_part_or_404(db, part_id)

    extension = Path(file.filename or "").suffix or ".jpg"
    safe_name = f"{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / safe_name

    size = 0
    with destination.open("wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_SIZE_BYTES:
                out.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="Файл больше 10 МБ")
            out.write(chunk)

    public_url = f"{PUBLIC_UPLOAD_PREFIX}/{safe_name}"
    max_order = db.query(PartImage).filter_by(part_id=part.id).count()
    image = PartImage(part_id=part.id, url=public_url, sort_order=max_order,
                       is_primary=set_as_primary)
    db.add(image)

    if set_as_primary or part.primary_image is None:
        part.primary_image = public_url

    part.manual_override = True
    part.last_edited_at = utcnow()
    log_admin_action(db, part.id, "add_image", {"url": public_url, "source": "upload"})
    db.commit()

    return serialize_part_full(part)


@app.post("/admin/parts/{part_id}/images/by-url", dependencies=[Depends(require_admin)])
def admin_add_image_by_url(
    part_id: int, payload: AddImageByUrlRequest, db: Session = Depends(get_db)
):
    part = get_part_or_404(db, part_id)

    max_order = db.query(PartImage).filter_by(part_id=part.id).count()
    image = PartImage(part_id=part.id, url=payload.url, sort_order=max_order,
                       is_primary=payload.set_as_primary)
    db.add(image)

    if payload.set_as_primary or part.primary_image is None:
        part.primary_image = payload.url

    part.manual_override = True
    part.last_edited_at = utcnow()
    log_admin_action(db, part.id, "add_image", {"url": payload.url, "source": "url"})
    db.commit()

    return serialize_part_full(part)


@app.delete("/admin/parts/{part_id}/images", dependencies=[Depends(require_admin)])
def admin_delete_image(
    part_id: int, image_url: str = Query(...), db: Session = Depends(get_db)
):
    part = get_part_or_404(db, part_id)
    image = (
        db.query(PartImage)
        .filter_by(part_id=part.id, url=image_url)
        .one_or_none()
    )
    if image is None:
        raise HTTPException(status_code=404, detail="Изображение не найдено у этого товара")

    db.delete(image)

    if part.primary_image == image_url:
        next_image = (
            db.query(PartImage)
            .filter_by(part_id=part.id)
            .filter(PartImage.url != image_url)
            .order_by(PartImage.sort_order)
            .first()
        )
        part.primary_image = next_image.url if next_image else None

    if image_url.startswith(PUBLIC_UPLOAD_PREFIX):
        local_path = UPLOAD_DIR / Path(image_url).name
        local_path.unlink(missing_ok=True)

    part.manual_override = True
    part.last_edited_at = utcnow()
    log_admin_action(db, part.id, "delete_image", {"url": image_url})
    db.commit()

    return serialize_part_full(part)


@app.put("/admin/parts/{part_id}/images/reorder", dependencies=[Depends(require_admin)])
def admin_reorder_images(
    part_id: int, payload: ImageReorderRequest, db: Session = Depends(get_db)
):
    part = get_part_or_404(db, part_id)
    existing = {img.url: img for img in part.images}

    for item in payload.images:
        img = existing.get(item.url)
        if img is None:
            raise HTTPException(status_code=400, detail=f"Изображение не найдено: {item.url}")
        img.sort_order = item.sort_order
        img.is_primary = item.is_primary
        if item.is_primary:
            part.primary_image = item.url

    part.manual_override = True
    part.last_edited_at = utcnow()
    log_admin_action(db, part.id, "reorder_images", {"count": len(payload.images)})
    db.commit()

    return serialize_part_full(part)


@app.get("/admin/parts/{part_id}/audit-log", dependencies=[Depends(require_admin)])
def admin_get_audit_log(part_id: int, db: Session = Depends(get_db)):
    get_part_or_404(db, part_id)
    logs = (
        db.query(AdminAuditLog)
        .filter_by(part_id=part_id)
        .order_by(AdminAuditLog.created_at.desc())
        .all()
    )
    return [
        {"action": l.action, "details": l.details, "created_at": l.created_at.isoformat()}
        for l in logs
    ]
