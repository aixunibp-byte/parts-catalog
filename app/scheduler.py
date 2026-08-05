"""
Периодический запуск синхронизации с Ozon по расписанию.
"""
import asyncio
import logging
import os

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from sync_ozon import run_sync

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("scheduler")

SYNC_INTERVAL_MINUTES = int(os.getenv("SYNC_INTERVAL_MINUTES", "60"))


async def job():
    logger.info("Запуск плановой синхронизации с Ozon")
    try:
        await run_sync()
    except Exception:
        logger.exception("Плановая синхронизация завершилась с ошибкой")


async def main():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(job, trigger=IntervalTrigger(minutes=SYNC_INTERVAL_MINUTES))
    scheduler.start()
    logger.info("Планировщик запущен, интервал: %d мин.", SYNC_INTERVAL_MINUTES)

    await job()

    while True:
        await asyncio.sleep(3600)


if __name__ == "__main__":
    asyncio.run(main())
