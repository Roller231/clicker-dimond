from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas, models

router = APIRouter(prefix="/upgrades", tags=["Upgrades"])


@router.get("/", response_model=List[schemas.UpgradeOut])
def list_upgrades(db: Session = Depends(get_db)):
    """Получить список всех улучшений."""
    return crud.get_all_upgrades(db)


@router.post("/", response_model=schemas.UpgradeOut, status_code=201)
def create_upgrade(upgrade: schemas.UpgradeCreate, db: Session = Depends(get_db)):
    """Создать новое улучшение (для админки)."""
    existing = crud.get_upgrade_by_key(db, upgrade.key)
    if existing:
        raise HTTPException(status_code=400, detail="Upgrade with this key already exists")
    return crud.create_upgrade(db, upgrade)


@router.get("/{upgrade_id}", response_model=schemas.UpgradeOut)
def get_upgrade(upgrade_id: int, db: Session = Depends(get_db)):
    """Получить улучшение по ID."""
    upgrade = crud.get_upgrade_by_id(db, upgrade_id)
    if not upgrade:
        raise HTTPException(status_code=404, detail="Upgrade not found")
    return upgrade


@router.patch("/{upgrade_id}", response_model=schemas.UpgradeOut)
def update_upgrade(upgrade_id: int, data: schemas.UpgradeUpdate, db: Session = Depends(get_db)):
    """Обновить улучшение."""
    upgrade = crud.get_upgrade_by_id(db, upgrade_id)
    if not upgrade:
        raise HTTPException(status_code=404, detail="Upgrade not found")
    return crud.update_upgrade(db, upgrade, data)


@router.delete("/{upgrade_id}", status_code=204)
def delete_upgrade(upgrade_id: int, db: Session = Depends(get_db)):
    """Удалить улучшение."""
    upgrade = crud.get_upgrade_by_id(db, upgrade_id)
    if not upgrade:
        raise HTTPException(status_code=404, detail="Upgrade not found")
    crud.delete_upgrade(db, upgrade)


@router.get("/user/{user_id}", response_model=List[schemas.UserUpgradeWithDetails])
def get_user_upgrades(user_id: int, db: Session = Depends(get_db)):
    """Получить все улучшения пользователя с деталями."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    all_upgrades = crud.get_all_upgrades(db)
    user_upgrades = crud.get_user_upgrades(db, user_id)

    user_upgrade_map = {uu.upgrade_id: uu.level for uu in user_upgrades}

    result = []
    for upgrade in all_upgrades:
        level = user_upgrade_map.get(upgrade.id, 0)
        next_price = crud.calc_upgrade_price(upgrade, level)
        result.append(schemas.UserUpgradeWithDetails(
            upgrade_key=upgrade.key,
            upgrade_title=upgrade.title,
            level=level,
            next_price=next_price,
        ))

    return result


@router.post("/user/{user_id}/buy", response_model=schemas.UserUpgradeOut)
def buy_upgrade(user_id: int, req: schemas.BuyUpgradeRequest, db: Session = Depends(get_db)):
    """Купить улучшение для пользователя."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    upgrade = crud.get_upgrade_by_key(db, req.upgrade_key)
    if not upgrade:
        raise HTTPException(status_code=404, detail="Upgrade not found")

    user_upgrade = crud.buy_upgrade(db, user, upgrade)
    if not user_upgrade:
        raise HTTPException(status_code=400, detail="Cannot buy upgrade (not enough balance or max level reached)")

    # Обновляем прогресс заданий на покупку улучшений
    crud.update_task_progress(db, user_id, "buy_upgrade", 1)

    # Если это улучшение maxEnergy, обновляем max_energy пользователя
    if upgrade.key == "maxEnergy":
        new_max = 100 + user_upgrade.level * 25
        crud.update_max_energy(db, user, new_max)

    return user_upgrade
