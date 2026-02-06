from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
import math

from . import models, schemas


# ─────────────────────────────────────────────────────────────
# User CRUD
# ─────────────────────────────────────────────────────────────
def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_telegram_id(db: Session, telegram_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.telegram_id == telegram_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def get_leaderboard(db: Session, limit: int = 50) -> List[models.User]:
    return db.query(models.User).order_by(desc(models.User.balance)).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        url_image=user.url_image,
        balance=0,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: models.User, data: schemas.UserUpdate) -> models.User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def add_balance(db: Session, user: models.User, amount: int) -> models.User:
    user.balance += amount
    db.commit()
    db.refresh(user)
    return user


# ─────────────────────────────────────────────────────────────
# Energy CRUD
# ─────────────────────────────────────────────────────────────
from datetime import datetime, timezone

def get_user_with_regenerated_energy(db: Session, user: models.User) -> models.User:
    """Рассчитать восстановленную энергию с момента последнего обновления."""
    now = datetime.now(timezone.utc)
    last_update = user.last_energy_update
    
    if last_update is None:
        last_update = now
    
    # Убедимся, что last_update имеет timezone
    if last_update.tzinfo is None:
        last_update = last_update.replace(tzinfo=timezone.utc)
    
    # Рассчитываем сколько секунд прошло
    seconds_passed = (now - last_update).total_seconds()
    
    # 1 энергия в секунду
    energy_to_add = int(seconds_passed)
    
    if energy_to_add > 0:
        new_energy = min(user.energy + energy_to_add, user.max_energy)
        user.energy = new_energy
        user.last_energy_update = now
        db.commit()
        db.refresh(user)
    
    return user


def consume_energy(db: Session, user: models.User, amount: int = 1) -> bool:
    """Потратить энергию. Возвращает True если успешно."""
    # Сначала восстанавливаем энергию
    user = get_user_with_regenerated_energy(db, user)
    
    if user.energy < amount:
        return False
    
    user.energy -= amount
    user.last_energy_update = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return True


def update_max_energy(db: Session, user: models.User, new_max: int) -> models.User:
    """Обновить максимальную энергию пользователя."""
    user.max_energy = new_max
    db.commit()
    db.refresh(user)
    return user


# ─────────────────────────────────────────────────────────────
# Upgrade CRUD
# ─────────────────────────────────────────────────────────────
def get_upgrade_by_id(db: Session, upgrade_id: int) -> Optional[models.Upgrade]:
    return db.query(models.Upgrade).filter(models.Upgrade.id == upgrade_id).first()


def get_upgrade_by_key(db: Session, key: str) -> Optional[models.Upgrade]:
    return db.query(models.Upgrade).filter(models.Upgrade.key == key).first()


def get_all_upgrades(db: Session) -> List[models.Upgrade]:
    return db.query(models.Upgrade).all()


def create_upgrade(db: Session, upgrade: schemas.UpgradeCreate) -> models.Upgrade:
    db_upgrade = models.Upgrade(
        key=upgrade.key,
        title=upgrade.title,
        description=upgrade.description,
        base_price=upgrade.base_price,
        price_multiplier=upgrade.price_multiplier,
        max_level=upgrade.max_level,
    )
    db.add(db_upgrade)
    db.commit()
    db.refresh(db_upgrade)
    return db_upgrade


def update_upgrade(db: Session, upgrade: models.Upgrade, data: schemas.UpgradeUpdate) -> models.Upgrade:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(upgrade, field, value)
    db.commit()
    db.refresh(upgrade)
    return upgrade


def delete_upgrade(db: Session, upgrade: models.Upgrade) -> None:
    db.delete(upgrade)
    db.commit()


# ─────────────────────────────────────────────────────────────
# UserUpgrade CRUD
# ─────────────────────────────────────────────────────────────
def get_user_upgrade(db: Session, user_id: int, upgrade_id: int) -> Optional[models.UserUpgrade]:
    return db.query(models.UserUpgrade).filter(
        models.UserUpgrade.user_id == user_id,
        models.UserUpgrade.upgrade_id == upgrade_id,
    ).first()


def get_user_upgrades(db: Session, user_id: int) -> List[models.UserUpgrade]:
    return db.query(models.UserUpgrade).filter(models.UserUpgrade.user_id == user_id).all()


def calc_upgrade_price(upgrade: models.Upgrade, level: int) -> int:
    multiplier = upgrade.price_multiplier / 100.0
    return math.floor(upgrade.base_price * (multiplier ** level))


def buy_upgrade(db: Session, user: models.User, upgrade: models.Upgrade) -> Optional[models.UserUpgrade]:
    user_upgrade = get_user_upgrade(db, user.id, upgrade.id)

    current_level = user_upgrade.level if user_upgrade else 0

    if current_level >= upgrade.max_level:
        return None

    price = calc_upgrade_price(upgrade, current_level)

    if user.balance < price:
        return None

    user.balance -= price

    if user_upgrade:
        user_upgrade.level += 1
    else:
        user_upgrade = models.UserUpgrade(
            user_id=user.id,
            upgrade_id=upgrade.id,
            level=1,
        )
        db.add(user_upgrade)

    db.commit()
    db.refresh(user_upgrade)
    return user_upgrade


# ─────────────────────────────────────────────────────────────
# Transfer CRUD
# ─────────────────────────────────────────────────────────────
def create_transfer(db: Session, sender: models.User, receiver: models.User, amount: int) -> Optional[models.Transfer]:
    if sender.balance < amount or amount <= 0:
        return None

    sender.balance -= amount
    receiver.balance += amount

    transfer = models.Transfer(
        sender_id=sender.id,
        receiver_id=receiver.id,
        amount=amount,
    )
    db.add(transfer)
    db.commit()
    db.refresh(transfer)
    return transfer


def get_user_transfers(db: Session, user_id: int, limit: int = 50) -> List[models.Transfer]:
    return db.query(models.Transfer).filter(
        (models.Transfer.sender_id == user_id) | (models.Transfer.receiver_id == user_id)
    ).order_by(desc(models.Transfer.created_at)).limit(limit).all()


# ─────────────────────────────────────────────────────────────
# Shop CRUD
# ─────────────────────────────────────────────────────────────
def get_shop_item_by_id(db: Session, item_id: int) -> Optional[models.ShopItem]:
    return db.query(models.ShopItem).filter(models.ShopItem.id == item_id).first()


def get_all_shop_items(db: Session, active_only: bool = True) -> List[models.ShopItem]:
    query = db.query(models.ShopItem)
    if active_only:
        query = query.filter(models.ShopItem.is_active == True)
    return query.all()


def create_shop_item(db: Session, item: schemas.ShopItemCreate) -> models.ShopItem:
    db_item = models.ShopItem(
        crystals=item.crystals,
        stars=item.stars,
        ton_price=item.ton_price,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_shop_item(db: Session, item: models.ShopItem, data: schemas.ShopItemUpdate) -> models.ShopItem:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_shop_item(db: Session, item: models.ShopItem) -> None:
    db.delete(item)
    db.commit()


def create_purchase(db: Session, user: models.User, shop_item: models.ShopItem) -> models.Purchase:
    """Создать покупку и начислить кристаллы пользователю."""
    user.balance += shop_item.crystals

    purchase = models.Purchase(
        user_id=user.id,
        shop_item_id=shop_item.id,
        crystals=shop_item.crystals,
        stars=shop_item.stars,
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase


def get_user_purchases(db: Session, user_id: int, limit: int = 50) -> List[models.Purchase]:
    return db.query(models.Purchase).filter(
        models.Purchase.user_id == user_id
    ).order_by(desc(models.Purchase.created_at)).limit(limit).all()


# ─────────────────────────────────────────────────────────────
# Task CRUD
# ─────────────────────────────────────────────────────────────
from datetime import date, timedelta


def get_task_by_id(db: Session, task_id: int) -> Optional[models.Task]:
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def get_all_tasks(db: Session, active_only: bool = True) -> List[models.Task]:
    query = db.query(models.Task)
    if active_only:
        query = query.filter(models.Task.is_active == True)
    return query.all()


def get_tasks_by_type(db: Session, task_type: str, active_only: bool = True) -> List[models.Task]:
    query = db.query(models.Task).filter(models.Task.task_type == task_type)
    if active_only:
        query = query.filter(models.Task.is_active == True)
    return query.all()


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    db_task = models.Task(
        task_type=task.task_type,
        action_type=task.action_type,
        target_value=task.target_value,
        reward=task.reward,
        title=task.title,
        description=task.description,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task: models.Task, data: schemas.TaskUpdate) -> models.Task:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: models.Task) -> None:
    db.delete(task)
    db.commit()


# ─────────────────────────────────────────────────────────────
# UserTask CRUD
# ─────────────────────────────────────────────────────────────
def get_current_period_start(task_type: str) -> date:
    """Получить дату начала текущего периода для задания."""
    today = date.today()
    if task_type == "daily":
        return today
    elif task_type == "weekly":
        # Понедельник текущей недели
        return today - timedelta(days=today.weekday())
    return today


def get_user_task(db: Session, user_id: int, task_id: int) -> Optional[models.UserTask]:
    return db.query(models.UserTask).filter(
        models.UserTask.user_id == user_id,
        models.UserTask.task_id == task_id,
    ).first()


def get_or_create_user_task(db: Session, user_id: int, task: models.Task) -> models.UserTask:
    """Получить или создать прогресс пользователя по заданию для текущего периода."""
    period_start = get_current_period_start(task.task_type)
    
    user_task = db.query(models.UserTask).filter(
        models.UserTask.user_id == user_id,
        models.UserTask.task_id == task.id,
        models.UserTask.period_start == period_start,
    ).first()
    
    if not user_task:
        user_task = models.UserTask(
            user_id=user_id,
            task_id=task.id,
            progress=0,
            is_completed=False,
            is_claimed=False,
            period_start=period_start,
        )
        db.add(user_task)
        db.commit()
        db.refresh(user_task)
    
    return user_task


def get_user_tasks_with_details(db: Session, user_id: int, task_type: Optional[str] = None) -> List[dict]:
    """Получить все задания пользователя с деталями и прогрессом."""
    tasks = get_all_tasks(db, active_only=True)
    if task_type:
        tasks = [t for t in tasks if t.task_type == task_type]
    
    result = []
    for task in tasks:
        user_task = get_or_create_user_task(db, user_id, task)
        result.append({
            "task_id": task.id,
            "task_type": task.task_type,
            "action_type": task.action_type,
            "title": task.title,
            "description": task.description,
            "target_value": task.target_value,
            "reward": task.reward,
            "progress": user_task.progress,
            "is_completed": user_task.is_completed,
            "is_claimed": user_task.is_claimed,
        })
    
    return result


def update_task_progress(db: Session, user_id: int, action_type: str, amount: int) -> None:
    """Обновить прогресс по всем активным заданиям с указанным action_type."""
    tasks = db.query(models.Task).filter(
        models.Task.action_type == action_type,
        models.Task.is_active == True,
    ).all()
    
    for task in tasks:
        user_task = get_or_create_user_task(db, user_id, task)
        
        if user_task.is_claimed:
            continue
        
        user_task.progress += amount
        
        if user_task.progress >= task.target_value:
            user_task.is_completed = True
    
    db.commit()


def claim_task_reward(db: Session, user: models.User, task: models.Task) -> Optional[models.UserTask]:
    """Забрать награду за выполненное задание."""
    user_task = get_or_create_user_task(db, user.id, task)
    
    if not user_task.is_completed or user_task.is_claimed:
        return None
    
    user.balance += task.reward
    user_task.is_claimed = True
    
    db.commit()
    db.refresh(user_task)
    return user_task


def reset_tasks_for_period(db: Session, task_type: str) -> int:
    """Сбросить прогресс заданий для нового периода. Возвращает количество сброшенных записей."""
    period_start = get_current_period_start(task_type)
    
    # Удаляем старые записи (не текущего периода)
    deleted = db.query(models.UserTask).filter(
        models.UserTask.task_id.in_(
            db.query(models.Task.id).filter(models.Task.task_type == task_type)
        ),
        models.UserTask.period_start < period_start,
    ).delete(synchronize_session=False)
    
    db.commit()
    return deleted


# ─────────────────────────────────────────────────────────────
# Admin Settings CRUD
# ─────────────────────────────────────────────────────────────
def get_admin_setting(db: Session, name: str) -> Optional[str]:
    """Получить значение настройки по ключу."""
    setting = db.query(models.AdminSettings).filter(models.AdminSettings.name == name).first()
    return setting.value if setting else None


def set_admin_setting(db: Session, name: str, value: str, description: str = "") -> models.AdminSettings:
    """Создать или обновить настройку."""
    setting = db.query(models.AdminSettings).filter(models.AdminSettings.name == name).first()
    if setting:
        setting.value = value
        if description:
            setting.description = description
    else:
        setting = models.AdminSettings(name=name, value=value, description=description)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting
