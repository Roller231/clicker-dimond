from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx

from ..database import get_db
from ..config import get_settings
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


class CreateInvoiceRequest(BaseModel):
    shop_item_id: int


class CreateInvoiceResponse(BaseModel):
    invoice_url: str


@router.post("/create-invoice", response_model=CreateInvoiceResponse)
async def create_stars_invoice(req: CreateInvoiceRequest, db: Session = Depends(get_db)):
    """
    Создать invoice для оплаты звёздами через Telegram Bot API.
    Возвращает URL для открытия через WebApp.openInvoice()
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

    # Создаём invoice через Telegram Bot API
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/createInvoiceLink",
            json={
                "title": f"{shop_item.crystals} кристаллов",
                "description": f"Покупка {shop_item.crystals} кристаллов за {shop_item.stars} звёзд",
                "payload": f"shop_item_{shop_item.id}",
                "currency": "XTR",  # XTR = Telegram Stars
                "prices": [
                    {
                        "label": f"{shop_item.crystals} кристаллов",
                        "amount": shop_item.stars  # В Stars amount = количество звёзд
                    }
                ]
            }
        )
        
        data = response.json()
        
        if not data.get("ok"):
            error_desc = data.get("description", "Unknown error")
            raise HTTPException(status_code=400, detail=f"Telegram API error: {error_desc}")
        
        invoice_url = data.get("result")
        
        return CreateInvoiceResponse(invoice_url=invoice_url)


@router.post("/payment", response_model=StarsPaymentResponse)
def process_stars_payment(req: StarsPaymentRequest, db: Session = Depends(get_db)):
    """
    Обработать платёж звёздами из Telegram.
    Вызывается после успешной оплаты через WebApp.openInvoice()
    """
    user = crud.get_user_by_id(db, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shop_item = crud.get_shop_item_by_id(db, req.shop_item_id)
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    if not shop_item.is_active:
        raise HTTPException(status_code=400, detail="Shop item is not available")

    # Создаём покупку и начисляем кристаллы
    purchase = crud.create_purchase(db, user, shop_item)

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
