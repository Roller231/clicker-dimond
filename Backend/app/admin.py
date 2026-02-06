"""
SQLAdmin configuration for the Clicker Diamond admin panel.
"""
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse

from .database import engine
from . import models


# ─────────────────────────────────────────────────────────────
# Authentication
# ─────────────────────────────────────────────────────────────
class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        # Проверяем логин и пароль
        if username == "admin" and password == "141722A!":
            request.session.update({"admin_logged_in": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request):
        # Возвращаем True если пользователь залогинен
        if request.session.get("admin_logged_in"):
            return True
        # Возвращаем None/False если не залогинен - SQLAdmin покажет форму логина
        return None


# ─────────────────────────────────────────────────────────────
# Model Views
# ─────────────────────────────────────────────────────────────
class UserAdmin(ModelView, model=models.User):
    name = "Пользователь"
    name_plural = "Пользователи"
    icon = "fa-solid fa-user"
    
    column_list = [
        models.User.id,
        models.User.telegram_id,
        models.User.username,
        models.User.first_name,
        models.User.balance,
        models.User.energy,
        models.User.max_energy,
        models.User.created_at,
    ]
    
    column_searchable_list = [
        models.User.telegram_id,
        models.User.username,
        models.User.first_name,
    ]
    
    column_sortable_list = [
        models.User.id,
        models.User.telegram_id,
        models.User.balance,
        models.User.created_at,
    ]
    
    column_labels = {
        models.User.id: "ID",
        models.User.telegram_id: "Telegram ID",
        models.User.username: "Username",
        models.User.first_name: "Имя",
        models.User.last_name: "Фамилия",
        models.User.url_image: "Аватар URL",
        models.User.balance: "Баланс",
        models.User.energy: "Энергия",
        models.User.max_energy: "Макс. энергия",
        models.User.last_energy_update: "Последнее обновление энергии",
        models.User.created_at: "Создан",
        models.User.updated_at: "Обновлён",
    }
    
    form_columns = [
        models.User.telegram_id,
        models.User.username,
        models.User.first_name,
        models.User.last_name,
        models.User.url_image,
        models.User.balance,
        models.User.energy,
        models.User.max_energy,
    ]


class UpgradeAdmin(ModelView, model=models.Upgrade):
    name = "Улучшение"
    name_plural = "Улучшения"
    icon = "fa-solid fa-arrow-up"
    
    column_list = [
        models.Upgrade.id,
        models.Upgrade.key,
        models.Upgrade.title,
        models.Upgrade.base_price,
        models.Upgrade.price_multiplier,
        models.Upgrade.max_level,
    ]
    
    column_searchable_list = [
        models.Upgrade.key,
        models.Upgrade.title,
    ]
    
    column_labels = {
        models.Upgrade.id: "ID",
        models.Upgrade.key: "Ключ",
        models.Upgrade.title: "Название",
        models.Upgrade.description: "Описание",
        models.Upgrade.base_price: "Базовая цена",
        models.Upgrade.price_multiplier: "Множитель цены (%)",
        models.Upgrade.max_level: "Макс. уровень",
        models.Upgrade.created_at: "Создано",
    }


class UserUpgradeAdmin(ModelView, model=models.UserUpgrade):
    name = "Улучшение игрока"
    name_plural = "Улучшения игроков"
    icon = "fa-solid fa-level-up"
    
    column_list = [
        models.UserUpgrade.id,
        models.UserUpgrade.user_id,
        models.UserUpgrade.upgrade_id,
        models.UserUpgrade.level,
        models.UserUpgrade.updated_at,
    ]
    
    column_labels = {
        models.UserUpgrade.id: "ID",
        models.UserUpgrade.user_id: "Пользователь",
        models.UserUpgrade.upgrade_id: "Улучшение",
        models.UserUpgrade.level: "Уровень",
        models.UserUpgrade.updated_at: "Обновлено",
    }
    
    form_columns = [
        models.UserUpgrade.user_id,
        models.UserUpgrade.upgrade_id,
        models.UserUpgrade.level,
    ]


class TransferAdmin(ModelView, model=models.Transfer):
    name = "Перевод"
    name_plural = "Переводы"
    icon = "fa-solid fa-exchange"
    
    column_list = [
        models.Transfer.id,
        models.Transfer.sender_id,
        models.Transfer.receiver_id,
        models.Transfer.amount,
        models.Transfer.created_at,
    ]
    
    column_sortable_list = [
        models.Transfer.id,
        models.Transfer.amount,
        models.Transfer.created_at,
    ]
    
    column_labels = {
        models.Transfer.id: "ID",
        models.Transfer.sender_id: "Отправитель",
        models.Transfer.receiver_id: "Получатель",
        models.Transfer.amount: "Сумма",
        models.Transfer.created_at: "Дата",
    }
    
    can_create = False
    can_edit = False


class ShopItemAdmin(ModelView, model=models.ShopItem):
    name = "Товар магазина"
    name_plural = "Товары магазина"
    icon = "fa-solid fa-shopping-cart"
    
    column_list = [
        models.ShopItem.id,
        models.ShopItem.crystals,
        models.ShopItem.stars,
        models.ShopItem.ton_price,
        models.ShopItem.is_active,
        models.ShopItem.created_at,
    ]
    
    column_labels = {
        models.ShopItem.id: "ID",
        models.ShopItem.crystals: "Кристаллы",
        models.ShopItem.stars: "Звёзды",
        models.ShopItem.ton_price: "Цена в TON",
        models.ShopItem.is_active: "Активен",
        models.ShopItem.created_at: "Создан",
    }


class PurchaseAdmin(ModelView, model=models.Purchase):
    name = "Покупка"
    name_plural = "Покупки"
    icon = "fa-solid fa-credit-card"
    
    column_list = [
        models.Purchase.id,
        models.Purchase.user_id,
        models.Purchase.shop_item_id,
        models.Purchase.crystals,
        models.Purchase.stars,
        models.Purchase.created_at,
    ]
    
    column_labels = {
        models.Purchase.id: "ID",
        models.Purchase.user_id: "Пользователь",
        models.Purchase.shop_item_id: "Товар",
        models.Purchase.crystals: "Кристаллы",
        models.Purchase.stars: "Звёзды",
        models.Purchase.created_at: "Дата",
    }
    
    can_create = False
    can_edit = False


class TaskAdmin(ModelView, model=models.Task):
    name = "Задание"
    name_plural = "Задания"
    icon = "fa-solid fa-tasks"
    
    column_list = [
        models.Task.id,
        models.Task.task_type,
        models.Task.action_type,
        models.Task.title,
        models.Task.target_value,
        models.Task.reward,
        models.Task.is_active,
    ]
    
    column_searchable_list = [
        models.Task.title,
        models.Task.action_type,
    ]
    
    column_labels = {
        models.Task.id: "ID",
        models.Task.task_type: "Тип (daily/weekly)",
        models.Task.action_type: "Действие",
        models.Task.target_value: "Цель",
        models.Task.reward: "Награда",
        models.Task.title: "Название",
        models.Task.description: "Описание",
        models.Task.is_active: "Активно",
        models.Task.created_at: "Создано",
    }


class UserTaskAdmin(ModelView, model=models.UserTask):
    name = "Прогресс задания"
    name_plural = "Прогресс заданий"
    icon = "fa-solid fa-check-circle"
    
    column_list = [
        models.UserTask.id,
        models.UserTask.user_id,
        models.UserTask.task_id,
        models.UserTask.progress,
        models.UserTask.is_completed,
        models.UserTask.is_claimed,
        models.UserTask.period_start,
    ]
    
    column_sortable_list = [
        models.UserTask.id,
        models.UserTask.progress,
        models.UserTask.period_start,
    ]
    
    column_labels = {
        models.UserTask.id: "ID",
        models.UserTask.user_id: "Пользователь",
        models.UserTask.task_id: "Задание",
        models.UserTask.progress: "Прогресс",
        models.UserTask.is_completed: "Выполнено",
        models.UserTask.is_claimed: "Награда получена",
        models.UserTask.period_start: "Начало периода",
        models.UserTask.updated_at: "Обновлено",
    }


class AdminSettingsAdmin(ModelView, model=models.AdminSettings):
    name = "Настройка"
    name_plural = "Настройки бота"
    icon = "fa-solid fa-cog"
    
    column_list = [
        models.AdminSettings.id,
        models.AdminSettings.name,
        models.AdminSettings.value,
        models.AdminSettings.description,
        models.AdminSettings.updated_at,
    ]
    
    column_searchable_list = [
        models.AdminSettings.name,
        models.AdminSettings.description,
    ]
    
    column_labels = {
        models.AdminSettings.id: "ID",
        models.AdminSettings.name: "Ключ",
        models.AdminSettings.value: "Значение",
        models.AdminSettings.description: "Описание",
        models.AdminSettings.updated_at: "Обновлено",
    }
    
    form_columns = [
        models.AdminSettings.name,
        models.AdminSettings.value,
        models.AdminSettings.description,
    ]


# ─────────────────────────────────────────────────────────────
# Setup Admin
# ─────────────────────────────────────────────────────────────
def setup_admin(app):
    """Initialize SQLAdmin with all model views."""
    # Без аутентификации пока
    admin = Admin(
        app,
        engine,
        title="Clicker Diamond Admin",
        base_url="/admin",
    )
    
    # Register all model views
    admin.add_view(UserAdmin)
    admin.add_view(UpgradeAdmin)
    admin.add_view(UserUpgradeAdmin)
    admin.add_view(TransferAdmin)
    admin.add_view(ShopItemAdmin)
    admin.add_view(PurchaseAdmin)
    admin.add_view(TaskAdmin)
    admin.add_view(UserTaskAdmin)
    admin.add_view(AdminSettingsAdmin)
    
    return admin
