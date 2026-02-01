from sqlalchemy import Column, Integer, BigInteger, String, DateTime, ForeignKey, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    url_image = Column(Text, nullable=True)
    balance = Column(BigInteger, default=0, nullable=False)
    energy = Column(Integer, default=100, nullable=False)
    max_energy = Column(Integer, default=100, nullable=False)
    last_energy_update = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    upgrades = relationship("UserUpgrade", back_populates="user")
    transfers_sent = relationship("Transfer", foreign_keys="Transfer.sender_id", back_populates="sender")
    transfers_received = relationship("Transfer", foreign_keys="Transfer.receiver_id", back_populates="receiver")


class Upgrade(Base):
    __tablename__ = "upgrades"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Integer, default=10, nullable=False)
    price_multiplier = Column(Integer, default=135)  # 1.35 stored as 135
    max_level = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_upgrades = relationship("UserUpgrade", back_populates="upgrade")


class UserUpgrade(Base):
    __tablename__ = "user_upgrades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    upgrade_id = Column(Integer, ForeignKey("upgrades.id", ondelete="CASCADE"), nullable=False)
    level = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="upgrades")
    upgrade = relationship("Upgrade", back_populates="user_upgrades")


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    amount = Column(BigInteger, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="transfers_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="transfers_received")


# ─────────────────────────────────────────────────────────────
# Донатный магазин
# ─────────────────────────────────────────────────────────────
class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(Integer, primary_key=True, index=True)
    crystals = Column(Integer, nullable=False)  # количество кристаллов
    stars = Column(Integer, nullable=False)     # цена в звёздах (реальная валюта)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Purchase(Base):
    """История покупок в донатном магазине."""
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shop_item_id = Column(Integer, ForeignKey("shop_items.id", ondelete="SET NULL"), nullable=True)
    crystals = Column(Integer, nullable=False)
    stars = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    shop_item = relationship("ShopItem")


# ─────────────────────────────────────────────────────────────
# Задания (ежедневные / еженедельные)
# ─────────────────────────────────────────────────────────────
class Task(Base):
    """Шаблон задания, настраиваемый админом."""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_type = Column(String(20), nullable=False)  # "daily" или "weekly"
    action_type = Column(String(50), nullable=False)  # "transfer", "earn", "click", "buy_upgrade" и т.д.
    target_value = Column(Integer, nullable=False)  # целевое значение (N алмазов, K кликов)
    reward = Column(Integer, nullable=False)  # награда в кристаллах
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_tasks = relationship("UserTask", back_populates="task")


class UserTask(Base):
    """Прогресс пользователя по заданию."""
    __tablename__ = "user_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    progress = Column(Integer, default=0, nullable=False)  # текущий прогресс
    is_completed = Column(Boolean, default=False, nullable=False)
    is_claimed = Column(Boolean, default=False, nullable=False)  # награда получена
    period_start = Column(Date, nullable=False)  # начало периода (для отслеживания сброса)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    task = relationship("Task", back_populates="user_tasks")
