from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/transfers", tags=["Transfers"])


@router.post("/{sender_id}", response_model=schemas.TransferOut, status_code=201)
def create_transfer(sender_id: int, req: schemas.TransferCreate, db: Session = Depends(get_db)):
    """Перевести монеты другому пользователю."""
    sender = crud.get_user_by_id(db, sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    receiver = None
    if req.receiver_telegram_id:
        receiver = crud.get_user_by_telegram_id(db, req.receiver_telegram_id)
    elif req.receiver_username:
        receiver = crud.get_user_by_username(db, req.receiver_username)

    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    if sender.id == receiver.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to yourself")

    transfer = crud.create_transfer(db, sender, receiver, req.amount)
    if not transfer:
        raise HTTPException(status_code=400, detail="Insufficient balance or invalid amount")

    # Обновляем прогресс заданий на переводы
    crud.update_task_progress(db, sender_id, "transfer", req.amount)

    return transfer


@router.get("/{user_id}/history", response_model=List[schemas.TransferHistory])
def get_transfer_history(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    """Получить историю переводов пользователя."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    transfers = crud.get_user_transfers(db, user_id, limit=limit)

    result = []
    for t in transfers:
        if t.sender_id == user_id:
            direction = "sent"
            other_user_id = t.receiver_id
            other_user = crud.get_user_by_id(db, t.receiver_id) if t.receiver_id else None
        else:
            direction = "received"
            other_user_id = t.sender_id
            other_user = crud.get_user_by_id(db, t.sender_id) if t.sender_id else None

        result.append(schemas.TransferHistory(
            id=t.id,
            amount=t.amount,
            created_at=t.created_at,
            direction=direction,
            other_user_id=other_user_id,
            other_username=other_user.username if other_user else None,
        ))

    return result
