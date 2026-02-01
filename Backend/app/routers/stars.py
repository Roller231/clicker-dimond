from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
import httpx

from ..database import get_db
from ..config import get_settings
from .. import crud, models

router = APIRouter(prefix="/stars", tags=["Stars Payment"])


class CreateInvoiceRequest(BaseModel):
    shop_item_id: int
    user_id: int


class CreateInvoiceResponse(BaseModel):
    invoice_link: str


class SuccessRequest(BaseModel):
    user_id: int


class SuccessResponse(BaseModel):
    success: bool
    crystals_added: int
    new_balance: int


@router.post("/create", response_model=CreateInvoiceResponse)
async def create_stars_invoice(req: CreateInvoiceRequest, db: Session = Depends(get_db)):
    """
    Создать invoice для оплаты звёздами.
    Сохраняем pending платёж в БД с уникальным payload.
    """
    settings = get_settings()
    BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
    if not BOT_TOKEN or BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        raise HTTPException(status_code=500, detail="Bot token not configured")

    user = crud.get_user_by_id(db, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shop_item = crud.get_shop_item_by_id(db, req.shop_item_id)
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    if not shop_item.is_active:
        raise HTTPException(status_code=400, detail="Shop item is not available")

    # Уникальный payload — ключевой момент!
    payload = f"stars_{uuid4()}"

    # Создаём invoice через Telegram Bot API
    # ВАЖНО: НЕ передаём provider_token для Telegram Stars!
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/createInvoiceLink",
            json={
                "title": "Покупка кристаллов",
                "description": f"{shop_item.stars} ⭐",
                "payload": payload,
                "currency": "XTR",
                "prices": [{"label": "Stars", "amount": shop_item.stars}]
            }
        )
        
        data = response.json()
        
        if not data.get("ok"):
            error_desc = data.get("description", "Unknown error")
            raise HTTPException(status_code=400, detail=f"Telegram API error: {error_desc}")
        
        invoice_link = data.get("result")

    # Сохраняем pending платёж в БД
    pending = models.StarsPending(
        user_id=req.user_id,
        shop_item_id=req.shop_item_id,
        payload=payload,
        status="pending"
    )
    db.add(pending)
    db.commit()
        
    return CreateInvoiceResponse(invoice_link=invoice_link)


@router.post("/success", response_model=SuccessResponse)
def confirm_stars_payment(req: SuccessRequest, db: Session = Depends(get_db)):
    """
    Подтвердить успешный платёж и начислить кристаллы.
    Вызывается после события invoiceClosed со статусом 'paid'.
    """
    user = crud.get_user_by_id(db, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ищем последний pending платёж в БД
    pending = (
        db.query(models.StarsPending)
        .filter(
            models.StarsPending.user_id == req.user_id,
            models.StarsPending.status == "pending"
        )
        .order_by(models.StarsPending.created_at.desc())
        .first()
    )

    if not pending:
        raise HTTPException(status_code=400, detail="No pending payment found")

    # Уже обработан — идемпотентность
    if pending.status == "success":
        return SuccessResponse(
            success=True,
            crystals_added=0,
            new_balance=user.balance,
        )

    shop_item = crud.get_shop_item_by_id(db, pending.shop_item_id)
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    # Создаём покупку и начисляем кристаллы
    crud.create_purchase(db, user, shop_item)

    # Помечаем платёж как успешный
    pending.status = "success"
    pending.completed_at = datetime.utcnow()
    db.commit()

    return SuccessResponse(
        success=True,
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
