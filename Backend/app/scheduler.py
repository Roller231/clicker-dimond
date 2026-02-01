"""
Планировщик для автоматического сброса заданий.

- Ежедневные задания сбрасываются каждый день в 00:00
- Еженедельные задания сбрасываются каждый понедельник в 00:00
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .database import SessionLocal
from . import crud

scheduler = BackgroundScheduler()


def reset_daily_tasks():
    """Сбросить ежедневные задания."""
    db = SessionLocal()
    try:
        deleted = crud.reset_tasks_for_period(db, "daily")
        print(f"[Scheduler] Reset daily tasks: {deleted} records deleted")
    except Exception as e:
        print(f"[Scheduler] Error resetting daily tasks: {e}")
    finally:
        db.close()


def reset_weekly_tasks():
    """Сбросить еженедельные задания."""
    db = SessionLocal()
    try:
        deleted = crud.reset_tasks_for_period(db, "weekly")
        print(f"[Scheduler] Reset weekly tasks: {deleted} records deleted")
    except Exception as e:
        print(f"[Scheduler] Error resetting weekly tasks: {e}")
    finally:
        db.close()


def start_scheduler():
    """Запустить планировщик."""
    # Ежедневный сброс в 00:00
    scheduler.add_job(
        reset_daily_tasks,
        CronTrigger(hour=0, minute=0),
        id="reset_daily_tasks",
        replace_existing=True,
    )

    # Еженедельный сброс в понедельник 00:00
    scheduler.add_job(
        reset_weekly_tasks,
        CronTrigger(day_of_week="mon", hour=0, minute=0),
        id="reset_weekly_tasks",
        replace_existing=True,
    )

    scheduler.start()
    print("[Scheduler] Started - daily reset at 00:00, weekly reset on Monday 00:00")


def stop_scheduler():
    """Остановить планировщик."""
    scheduler.shutdown()
    print("[Scheduler] Stopped")
