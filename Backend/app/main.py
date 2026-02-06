from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from .database import engine, Base
from .routers import users, upgrades, transfers, shop, tasks, stars, settings, chat
from .scheduler import start_scheduler, stop_scheduler
from .admin import setup_admin
from . import crud, schemas
from .database import SessionLocal

# Создаём таблицы при старте
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Clicker Diamond API",
    description="Backend API для игры Clicker Diamond",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


class ForwardedProtoMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers") or [])
            forwarded_proto = headers.get(b"x-forwarded-proto")
            if forwarded_proto:
                try:
                    scope["scheme"] = forwarded_proto.decode("utf-8").split(",")[0].strip()
                except Exception:
                    pass
        await self.app(scope, receive, send)


app.add_middleware(ForwardedProtoMiddleware)

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware для SQLAdmin (должен быть после CORS)
app.add_middleware(
    SessionMiddleware, 
    secret_key="clicker-diamond-session-secret-key-2024",
    same_site="lax",
    https_only=False,
)

# SQLAdmin
setup_admin(app)

# Роутеры
app.include_router(users.router)
app.include_router(upgrades.router)
app.include_router(transfers.router)
app.include_router(shop.router)
app.include_router(tasks.router)
app.include_router(stars.router)
app.include_router(settings.router)
app.include_router(chat.router)


@app.on_event("startup")
def on_startup():
    """Создаём базовые улучшения при первом запуске."""
    db = SessionLocal()
    try:
        default_upgrades = [
            schemas.UpgradeCreate(key="click", title="Клик", description="+1 к доходу за клик", base_price=10, price_multiplier=135, max_level=100),
            schemas.UpgradeCreate(key="autoclick", title="Автоклик", description="Кликает сам раз в 2 сек", base_price=25, price_multiplier=135, max_level=50),
            schemas.UpgradeCreate(key="megaclick", title="Мега клик", description="Кликает сам раз в 1 сек", base_price=60, price_multiplier=140, max_level=30),
            schemas.UpgradeCreate(key="superclick", title="Суперклик", description="Кликает сам раз в 0.5 сек", base_price=140, price_multiplier=150, max_level=20),
            schemas.UpgradeCreate(key="maxEnergy", title="Макс. энергия", description="Увеличивает запас энергии на 25", base_price=15, price_multiplier=130, max_level=100),
        ]

        for upg in default_upgrades:
            existing = crud.get_upgrade_by_key(db, upg.key)
            if not existing:
                crud.create_upgrade(db, upg)

        # Создаём базовые товары магазина
        default_shop_items = [
            schemas.ShopItemCreate(crystals=100, stars=1),
            schemas.ShopItemCreate(crystals=550, stars=5),
            schemas.ShopItemCreate(crystals=1200, stars=10),
            schemas.ShopItemCreate(crystals=2500, stars=20),
            schemas.ShopItemCreate(crystals=6500, stars=50),
        ]
        existing_items = crud.get_all_shop_items(db, active_only=False)
        if not existing_items:
            for item in default_shop_items:
                crud.create_shop_item(db, item)

        # Создаём базовые задания
        default_tasks = [
            schemas.TaskCreate(task_type="daily", action_type="click", target_value=50, reward=50, title="Сделать 50 кликов", description="Кликай по алмазу 50 раз"),
            schemas.TaskCreate(task_type="daily", action_type="earn", target_value=300, reward=75, title="Заработать 300 💎", description="Накопи 300 кристаллов"),
            schemas.TaskCreate(task_type="daily", action_type="buy_upgrade", target_value=1, reward=100, title="Купить улучшение", description="Купи любое улучшение"),
            schemas.TaskCreate(task_type="weekly", action_type="transfer", target_value=100, reward=200, title="Передать 100 💎", description="Переведи 100 кристаллов другу"),
            schemas.TaskCreate(task_type="weekly", action_type="earn", target_value=2000, reward=500, title="Заработать 2000 💎", description="Накопи 2000 кристаллов за неделю"),
        ]
        existing_tasks = crud.get_all_tasks(db, active_only=False)
        if not existing_tasks:
            for task in default_tasks:
                crud.create_task(db, task)
        # Создаём настройку click_value если не существует
        existing_click_value = crud.get_admin_setting(db, "click_value")
        if not existing_click_value:
            crud.set_admin_setting(db, "click_value", "0.5", "Базовое значение за клик (без улучшений)")

    finally:
        db.close()

    # Запускаем планировщик
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    """Остановка планировщика при завершении."""
    stop_scheduler()


@app.get("/", tags=["Health"])
def health_check():
    """Проверка работоспособности API."""
    return {"status": "ok", "message": "Clicker Diamond API is running"}
