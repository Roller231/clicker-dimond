from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/shop", tags=["Shop"])


@router.get("/items", response_model=List[schemas.ShopItemOut])
def list_shop_items(db: Session = Depends(get_db)):
    """Получить список товаров донатного магазина."""
    return crud.get_all_shop_items(db, active_only=True)


@router.get("/items/all", response_model=List[schemas.ShopItemOut])
def list_all_shop_items(db: Session = Depends(get_db)):
    """Получить все товары (включая неактивные) — для админки."""
    return crud.get_all_shop_items(db, active_only=False)


@router.post("/items", response_model=schemas.ShopItemOut, status_code=201)
def create_shop_item(item: schemas.ShopItemCreate, db: Session = Depends(get_db)):
    """Создать новый товар в магазине."""
    return crud.create_shop_item(db, item)


@router.get("/items/{item_id}", response_model=schemas.ShopItemOut)
def get_shop_item(item_id: int, db: Session = Depends(get_db)):
    """Получить товар по ID."""
    item = crud.get_shop_item_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shop item not found")
    return item


@router.patch("/items/{item_id}", response_model=schemas.ShopItemOut)
def update_shop_item(item_id: int, data: schemas.ShopItemUpdate, db: Session = Depends(get_db)):
    """Обновить товар."""
    item = crud.get_shop_item_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shop item not found")
    return crud.update_shop_item(db, item, data)


@router.delete("/items/{item_id}", status_code=204)
def delete_shop_item(item_id: int, db: Session = Depends(get_db)):
    """Удалить товар."""
    item = crud.get_shop_item_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shop item not found")
    crud.delete_shop_item(db, item)


@router.post("/purchase/{user_id}", response_model=schemas.PurchaseOut, status_code=201)
def purchase_item(user_id: int, req: schemas.PurchaseRequest, db: Session = Depends(get_db)):
    """Купить товар (начислить кристаллы пользователю)."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shop_item = crud.get_shop_item_by_id(db, req.shop_item_id)
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    if not shop_item.is_active:
        raise HTTPException(status_code=400, detail="Shop item is not available")

    return crud.create_purchase(db, user, shop_item)


@router.get("/purchases/{user_id}", response_model=List[schemas.PurchaseOut])
def get_user_purchases(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Получить историю покупок пользователя."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_purchases(db, user_id, limit=limit)
