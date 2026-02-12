from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# User
# ─────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    url_image: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    url_image: Optional[str] = None
    balance: Optional[float] = None


class UserOut(UserBase):
    id: int
    balance: float
    energy: int
    max_energy: int
    last_energy_update: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserLeaderboard(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: Optional[str]
    url_image: Optional[str]
    balance: float

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Upgrade
# ─────────────────────────────────────────────────────────────
class UpgradeBase(BaseModel):
    key: str
    title: str
    description: Optional[str] = None
    base_price: int = 10
    price_multiplier: int = 135
    max_level: int = 100
    value_per_level: float = 1.0


class UpgradeCreate(UpgradeBase):
    pass


class UpgradeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[int] = None
    price_multiplier: Optional[int] = None
    max_level: Optional[int] = None
    value_per_level: Optional[float] = None


class UpgradeOut(UpgradeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# UserUpgrade
# ─────────────────────────────────────────────────────────────
class UserUpgradeOut(BaseModel):
    id: int
    user_id: int
    upgrade_id: int
    level: int
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpgradeWithDetails(BaseModel):
    upgrade_key: str
    upgrade_title: str
    level: int
    next_price: int
    value_per_level: float = 1.0

    class Config:
        from_attributes = True


class BuyUpgradeRequest(BaseModel):
    upgrade_key: str


# ─────────────────────────────────────────────────────────────
# Transfer
# ─────────────────────────────────────────────────────────────
class TransferCreate(BaseModel):
    receiver_telegram_id: Optional[int] = None
    receiver_username: Optional[str] = None
    amount: int


class TransferOut(BaseModel):
    id: int
    sender_id: Optional[int]
    receiver_id: Optional[int]
    amount: int
    created_at: datetime

    class Config:
        from_attributes = True


class TransferHistory(BaseModel):
    id: int
    amount: int
    created_at: datetime
    direction: str  # "sent" or "received"
    other_user_id: Optional[int]
    other_username: Optional[str]

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Balance
# ─────────────────────────────────────────────────────────────
class AddBalanceRequest(BaseModel):
    amount: float


class ClickRequest(BaseModel):
    clicks: int = 1


# ─────────────────────────────────────────────────────────────
# Shop (донатный магазин)
# ─────────────────────────────────────────────────────────────
class ShopItemBase(BaseModel):
    crystals: int
    stars: int
    ton_price: Optional[float] = None


class ShopItemCreate(ShopItemBase):
    pass


class ShopItemUpdate(BaseModel):
    crystals: Optional[int] = None
    stars: Optional[int] = None
    ton_price: Optional[float] = None
    is_active: Optional[bool] = None


class ShopItemOut(ShopItemBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseRequest(BaseModel):
    shop_item_id: int


class PurchaseOut(BaseModel):
    id: int
    user_id: int
    shop_item_id: Optional[int]
    crystals: int
    stars: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Tasks (задания)
# ─────────────────────────────────────────────────────────────
from datetime import date


class TaskBase(BaseModel):
    task_type: str  # "daily" или "weekly"
    action_type: str  # "transfer", "earn", "click", "buy_upgrade"
    target_value: int
    reward: int
    title: str
    description: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    task_type: Optional[str] = None
    action_type: Optional[str] = None
    target_value: Optional[int] = None
    reward: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TaskOut(TaskBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserTaskOut(BaseModel):
    id: int
    user_id: int
    task_id: int
    progress: int
    is_completed: bool
    is_claimed: bool
    period_start: date
    updated_at: datetime

    class Config:
        from_attributes = True


class UserTaskWithDetails(BaseModel):
    task_id: int
    task_type: str
    action_type: str
    title: str
    description: Optional[str]
    target_value: int
    reward: int
    progress: int
    is_completed: bool
    is_claimed: bool

    class Config:
        from_attributes = True


class ClaimTaskRequest(BaseModel):
    task_id: int


# ─────────────────────────────────────────────────────────────
# Chat (внутриигровой чат)
# ─────────────────────────────────────────────────────────────
class ChatMessageCreate(BaseModel):
    text: str


class ChatMessageOut(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    url_image: Optional[str] = None
    text: str
    created_at: datetime

    class Config:
        from_attributes = True
