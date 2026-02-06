from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/click-value")
def get_click_value(db: Session = Depends(get_db)):
    """Получить базовое значение клика."""
    value = crud.get_admin_setting(db, "click_value") or "0.5"
    return {"click_value": float(value)}
