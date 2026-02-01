from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx

from ..database import get_db
from ..config import get_settings
from .. import crud, models

router = APIRouter(prefix="/stars", tags=["Stars Payment"])

# Временное хранилище ожидающих платежей (user_id -> shop_item_id)
pending_payments: dict[int, int] = {}


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
    Сохраняем shop_item_id для user_id чтобы потом начислить кристаллы.
    """
    settings = get_settings()
    BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
    if not BOT_TOKEN or BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        raise HTTPException(status_code=500, detail="Bot token not configured")

    shop_item = crud.get_shop_item_by_id(db, req.shop_item_id)
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    if not shop_item.is_active:
        raise HTTPException(status_code=400, detail="Shop item is not available")

    # Сохраняем ожидающий платёж
    pending_payments[req.user_id] = req.shop_item_id

    # Создаём invoice через Telegram Bot API
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/createInvoiceLink",
            json={
                "title": f"{shop_item.crystals} кристаллов",
                "description": f"Покупка {shop_item.crystals} кристаллов за {shop_item.stars} звёзд",
                "payload": f"shop_{shop_item.id}_user_{req.user_id}",
                "currency": "XTR",
                "prices": [
                    {
                        "label": f"{shop_item.crystals} кристаллов",
                        "amount": shop_item.stars
                    }
                ]
            }
        )
        
        data = response.json()
        
        if not data.get("ok"):
            error_desc = data.get("description", "Unknown error")
            raise HTTPException(status_code=400, detail=f"Telegram API error: {error_desc}")
        
        invoice_link = data.get("result")
        
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

    # Получаем shop_item_id из ожидающих платежей
    shop_item_id = pending_payments.pop(req.user_id, None)
    if not shop_item_id:
        raise HTTPException(status_code=400, detail="No pending payment found")

    shop_item = crud.get_shop_item_by_id(db, shop_item_id)
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    # Создаём покупку и начисляем кристаллы
    crud.create_purchase(db, user, shop_item)

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
