from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from .. import crud, models

router = APIRouter(prefix="/stars", tags=["Stars Payment"])


class StarsPaymentRequest(BaseModel):
    user_id: int
    shop_item_id: int
    telegram_payment_id: str


class StarsPaymentResponse(BaseModel):
    success: bool
    user_id: int
    crystals_added: int
    new_balance: int


@router.post("/payment", response_model=StarsPaymentResponse)
def process_stars_payment(req: StarsPaymentRequest, db: Session = Depends(get_db)):
    """
    Обработать платёж звёздами из Telegram.
    
    В реальном приложении здесь должна быть верификация платежа через Telegram Bot API.
    Для простоты мы просто начисляем кристаллы.
    """
    user = crud.get_user_by_id(db, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shop_item = crud.get_shop_item_by_id(db, req.shop_item_id)
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    if not shop_item.is_active:
        raise HTTPException(status_code=400, detail="Shop item is not available")

    # TODO: В реальном приложении здесь нужно верифицировать telegram_payment_id
    # через Telegram Bot API (answerPreCheckoutQuery, etc.)
    
    # Создаём покупку и начисляем кристаллы
    purchase = crud.create_purchase(db, user, shop_item)

    # Обновляем прогресс заданий (если есть задания на покупку)
    # crud.update_task_progress(db, user.id, "purchase", 1)

    return StarsPaymentResponse(
        success=True,
        user_id=user.id,
        crystals_added=shop_item.crystals,
        new_balance=user.balance,
    )


@router.get("/items")
def get_stars_items(db: Session = Depends(get_db)):
    """Получить товары для покупки за звёзды."""
    items = crud.get_all_shop_items(db, active_only=True)
    return [
        {
            "id": item.id,
            "crystals": item.crystals,
            "stars": item.stars,
        }
        for item in items
    ]
