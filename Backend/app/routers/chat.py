from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/messages", response_model=List[schemas.ChatMessageOut])
def get_messages(
    limit: int = Query(50, le=100),
    before_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Получить последние сообщения чата."""
    messages = crud.get_chat_messages(db, limit=limit, before_id=before_id)
    # Разворачиваем, чтобы старые были сверху
    messages.reverse()

    result = []
    for msg in messages:
        result.append(schemas.ChatMessageOut(
            id=msg.id,
            user_id=msg.user_id,
            username=msg.user.username if msg.user else None,
            first_name=msg.user.first_name if msg.user else None,
            url_image=msg.user.url_image if msg.user else None,
            text=msg.text,
            created_at=msg.created_at,
        ))
    return result


@router.post("/messages/{user_id}", response_model=schemas.ChatMessageOut, status_code=201)
def send_message(
    user_id: int,
    body: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
):
    """Отправить сообщение в чат."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message is empty")
    if len(text) > 500:
        raise HTTPException(status_code=400, detail="Message too long (max 500)")

    msg = crud.create_chat_message(db, user_id=user.id, text=text)

    return schemas.ChatMessageOut(
        id=msg.id,
        user_id=msg.user_id,
        username=user.username,
        first_name=user.first_name,
        url_image=user.url_image,
        text=msg.text,
        created_at=msg.created_at,
    )
