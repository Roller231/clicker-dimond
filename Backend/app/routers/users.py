from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=schemas.UserOut, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Создать нового пользователя или вернуть существующего по telegram_id."""
    existing = crud.get_user_by_telegram_id(db, user.telegram_id)
    if existing:
        # Восстанавливаем энергию перед возвратом
        return crud.get_user_with_regenerated_energy(db, existing)
    return crud.create_user(db, user)


@router.get("/", response_model=List[schemas.UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список пользователей."""
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/leaderboard", response_model=List[schemas.UserLeaderboard])
def get_leaderboard(limit: int = Query(50, le=100), db: Session = Depends(get_db)):
    """Топ игроков по балансу."""
    return crud.get_leaderboard(db, limit=limit)


@router.get("/by-telegram/{telegram_id}", response_model=schemas.UserOut)
def get_user_by_telegram(telegram_id: int, db: Session = Depends(get_db)):
    """Получить пользователя по Telegram ID."""
    user = crud.get_user_by_telegram_id(db, telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Получить пользователя по ID."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_with_regenerated_energy(db, user)


@router.patch("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Обновить данные пользователя."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.update_user(db, user, data)


@router.post("/{user_id}/add-balance", response_model=schemas.UserOut)
def add_balance(user_id: int, req: schemas.AddBalanceRequest, db: Session = Depends(get_db)):
    """Добавить баланс пользователю (для покупок в магазине)."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    return crud.add_balance(db, user, req.amount)


@router.post("/{user_id}/click", response_model=schemas.UserOut)
def click(user_id: int, req: schemas.ClickRequest, db: Session = Depends(get_db)):
    """Обработать клики пользователя."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Восстанавливаем энергию
    user = crud.get_user_with_regenerated_energy(db, user)

    # Проверяем достаточно ли энергии
    if user.energy < req.clicks:
        raise HTTPException(status_code=400, detail="Not enough energy")

    # Тратим энергию
    if not crud.consume_energy(db, user, req.clicks):
        raise HTTPException(status_code=400, detail="Not enough energy")

    # Базовое значение клика из админ-настроек (по умолчанию 1)
    base_click_value = float(crud.get_admin_setting(db, "click_value") or "1")

    # Получаем уровень улучшения клика
    click_upgrade = crud.get_upgrade_by_key(db, "click")
    click_power = base_click_value
    if click_upgrade:
        user_upgrade = crud.get_user_upgrade(db, user.id, click_upgrade.id)
        if user_upgrade:
            vpl = click_upgrade.value_per_level or 1.0
            click_power = base_click_value + user_upgrade.level * vpl

    amount = req.clicks * click_power
    user = crud.add_balance(db, user, amount)

    # Обновляем прогресс заданий на клики
    crud.update_task_progress(db, user.id, "click", req.clicks)
    # Обновляем прогресс заданий на заработок
    crud.update_task_progress(db, user.id, "earn", int(amount))

    return user


@router.post("/{user_id}/passive", response_model=schemas.UserOut)
def passive_income(user_id: int, req: schemas.ClickRequest, db: Session = Depends(get_db)):
    """Пассивный доход (автоклик) - не тратит энергию."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Восстанавливаем энергию (но не тратим)
    user = crud.get_user_with_regenerated_energy(db, user)

    # Базовое значение клика из админ-настроек (по умолчанию 1)
    base_click_value = float(crud.get_admin_setting(db, "click_value") or "1")

    # Получаем уровень улучшения клика
    click_upgrade = crud.get_upgrade_by_key(db, "click")
    click_power = base_click_value
    if click_upgrade:
        user_upgrade = crud.get_user_upgrade(db, user.id, click_upgrade.id)
        if user_upgrade:
            vpl = click_upgrade.value_per_level or 1.0
            click_power = base_click_value + user_upgrade.level * vpl

    amount = req.clicks * click_power
    user = crud.add_balance(db, user, amount)

    # Обновляем прогресс заданий на заработок (но не на клики)
    crud.update_task_progress(db, user.id, "earn", int(amount))

    return user
