# Clicker Diamond Backend

FastAPI backend для игры Clicker Diamond с MySQL базой данных.

## Требования

- Python 3.10+
- MySQL Server (локальный)

## Установка

1. Создайте виртуальное окружение:
```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # Windows
# или source venv/bin/activate  # Linux/Mac
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте базу данных MySQL:
```sql
CREATE DATABASE clicker_diamond CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Настройте `.env` файл:
```
DATABASE_URL=mysql+pymysql://root:ВАШ_ПАРОЛЬ@localhost:3306/clicker_diamond
```

## Запуск

```bash
cd Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Документация

После запуска доступна по адресам:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Структура API

### Users (`/users`)
- `POST /users/` - Создать пользователя
- `GET /users/` - Список пользователей
- `GET /users/leaderboard` - Топ игроков по балансу
- `GET /users/by-telegram/{telegram_id}` - Получить по Telegram ID
- `GET /users/{user_id}` - Получить по ID
- `PATCH /users/{user_id}` - Обновить данные
- `POST /users/{user_id}/add-balance` - Добавить баланс
- `POST /users/{user_id}/click` - Обработать клики

### Upgrades (`/upgrades`)
- `GET /upgrades/` - Список всех улучшений
- `POST /upgrades/` - Создать улучшение
- `GET /upgrades/{upgrade_id}` - Получить улучшение
- `PATCH /upgrades/{upgrade_id}` - Обновить улучшение
- `DELETE /upgrades/{upgrade_id}` - Удалить улучшение
- `GET /upgrades/user/{user_id}` - Улучшения пользователя
- `POST /upgrades/user/{user_id}/buy` - Купить улучшение

### Transfers (`/transfers`)
- `POST /transfers/{sender_id}` - Перевести монеты
- `GET /transfers/{user_id}/history` - История переводов

## Модели данных

### User
- `telegram_id` - Telegram ID пользователя
- `username` - Username в Telegram
- `first_name`, `last_name` - Имя и фамилия
- `url_image` - URL аватарки
- `balance` - Баланс монет

### Upgrade
- `key` - Уникальный ключ (click, autoclick, megaclick, superclick, maxEnergy)
- `title` - Название
- `description` - Описание
- `base_price` - Базовая цена
- `price_multiplier` - Множитель цены (135 = 1.35x)
- `max_level` - Максимальный уровень

### Transfer
- `sender_id`, `receiver_id` - ID отправителя и получателя
- `amount` - Сумма перевода
