"""
Telegram Bot for Clicker Diamond
Based on working example, without referral logic
"""
import asyncio
import re
import uuid

import aiohttp
import aiomysql

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    PreCheckoutQuery,
    FSInputFile,
)
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.memory import MemoryStorage

from .config import (
    BOT_TOKEN,
    BOT_USERNAME,
    WEBAPP_URL,
    ADMIN_TG_IDS,
    DB_CONFIG,
    API_URL,
)


bot = Bot(BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())


class BroadcastState(StatesGroup):
    waiting_message = State()


# ================== DATABASE ==================

async def fetch_all_tg_ids():
    """Получить все telegram_id пользователей для рассылки."""
    conn = await aiomysql.connect(**DB_CONFIG)
    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT telegram_id FROM users WHERE telegram_id IS NOT NULL"
        )
        rows = await cur.fetchall()
    conn.close()
    return [int(r[0]) for r in rows if r[0]]


async def fetch_setting(name: str) -> str | None:
    """Получить настройку из admin_settings."""
    conn = await aiomysql.connect(**DB_CONFIG)
    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT value FROM admin_settings WHERE name=%s LIMIT 1",
            (name,)
        )
        row = await cur.fetchone()
    conn.close()
    return row[0] if row else None


# ================== API FUNCTIONS ==================

async def get_user_by_tg(tg_id: str):
    """Получить пользователя по telegram_id."""
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{API_URL}/users/by-telegram/{tg_id}") as resp:
            if resp.status == 404:
                return None
            return await resp.json()


async def create_user(payload: dict):
    """Создать пользователя через API."""
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{API_URL}/users/", json=payload) as resp:
            return await resp.json()


# ================== AVATAR ==================

async def get_avatar_url(user_id: int) -> str | None:
    """Получить URL аватара пользователя."""
    try:
        photos = await bot.get_user_profile_photos(user_id, limit=1)
        if photos.total_count == 0:
            return None
        file_id = photos.photos[0][-1].file_id
        file = await bot.get_file(file_id)
        return f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file.file_path}"
    except Exception:
        return None


# ================== TEMPLATE RENDER ==================

def render_start_message(raw: str, variables: dict):
    """
    Рендерит стартовое сообщение с переменными и кнопками.
    
    Формат:
    TEXT:
    Привет, {firstname}!
    
    BUTTONS:
    🚀 Играть|webapp
    📢 Канал|https://t.me/channel
    """
    if not raw:
        return "", None

    # Подстановка переменных
    for k, v in variables.items():
        raw = raw.replace(f"{{{k}}}", str(v or ""))

    text = ""
    buttons = []

    if "BUTTONS:" in raw:
        text_part, buttons_part = raw.split("BUTTONS:", 1)
    else:
        text_part, buttons_part = raw, ""

    if "TEXT:" in text_part:
        text = text_part.split("TEXT:", 1)[1].strip()
    else:
        text = text_part.strip()

    for line in buttons_part.strip().splitlines():
        if "|" not in line:
            continue

        label, action = line.split("|", 1)
        label = label.strip()
        action = action.strip()

        if action == "webapp":
            buttons.append(
                InlineKeyboardButton(
                    text=label,
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            )
        else:
            buttons.append(
                InlineKeyboardButton(
                    text=label,
                    url=action
                )
            )

    keyboard = None
    if buttons:
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[[btn] for btn in buttons]
        )

    return text, keyboard


def extract_button(text: str):
    """Извлекает кнопку из тега <btn>...</btn>."""
    btn_text = None

    match = re.search(r"<btn>(.*?)</btn>", text)
    if match:
        btn_text = match.group(1).strip()
        text = re.sub(r"<btn>.*?</btn>", "", text)

    keyboard = None
    if btn_text:
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[[
                InlineKeyboardButton(
                    text=btn_text,
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]]
        )

    return text.strip(), keyboard


# ================== BROADCAST ==================

async def broadcast_any(message: Message, text: str, keyboard):
    """Рассылка сообщения всем пользователям."""
    tg_ids = await fetch_all_tg_ids()
    print(f"📊 BROADCAST USERS: {len(tg_ids)}")

    for tg_id in tg_ids:
        try:
            if message.photo:
                await bot.send_photo(
                    chat_id=tg_id,
                    photo=message.photo[-1].file_id,
                    caption=text,
                    reply_markup=keyboard,
                    parse_mode="HTML"
                )
            elif message.video:
                await bot.send_video(
                    chat_id=tg_id,
                    video=message.video.file_id,
                    caption=text,
                    reply_markup=keyboard,
                    parse_mode="HTML"
                )
            elif message.document:
                await bot.send_document(
                    chat_id=tg_id,
                    document=message.document.file_id,
                    caption=text,
                    reply_markup=keyboard,
                    parse_mode="HTML"
                )
            else:
                await bot.send_message(
                    chat_id=tg_id,
                    text=text,
                    reply_markup=keyboard,
                    parse_mode="HTML",
                    disable_web_page_preview=True
                )

            await asyncio.sleep(0.1)

        except Exception as e:
            print(f"❌ FAIL {tg_id}: {e}")


@dp.message(lambda m: m.text == "/send")
async def start_broadcast(message: Message, state: FSMContext):
    """Начать рассылку (только для админов)."""
    if message.from_user.id not in ADMIN_TG_IDS:
        await message.answer("⛔ У тебя нет прав")
        return

    await state.set_state(BroadcastState.waiting_message)
    await message.answer(
        "📣 Отправь сообщение для рассылки\n"
        "Можно: текст / фото / видео + кнопки\n\n"
        "Добавь <btn>Текст кнопки</btn> для кнопки WebApp"
    )


@dp.message(BroadcastState.waiting_message)
async def process_broadcast_message(message: Message, state: FSMContext):
    """Обработка сообщения для рассылки."""
    if message.from_user.id not in ADMIN_TG_IDS:
        return

    await state.clear()
    await message.answer("🚀 Рассылка запущена")

    raw_text = message.text or message.caption or ""
    text, keyboard = extract_button(raw_text)
    asyncio.create_task(broadcast_any(message, text, keyboard))


# ================== PAYMENTS ==================

@dp.pre_checkout_query()
async def pre_checkout_handler(pre_checkout_query: PreCheckoutQuery):
    """Подтверждение pre-checkout для Telegram Stars."""
    await pre_checkout_query.answer(ok=True)


# ================== /start ==================

@dp.message(CommandStart())
async def start_handler(message: Message):
    """Обработчик команды /start."""
    tg_id = str(message.from_user.id)
    username = message.from_user.username
    firstname = message.from_user.first_name
    lastname = message.from_user.last_name

    # Проверяем/создаём пользователя
    user = await get_user_by_tg(tg_id)

    if not user:
        avatar_url = await get_avatar_url(message.from_user.id)

        payload = {
            "telegram_id": int(tg_id),
            "username": username,
            "first_name": firstname,
            "last_name": lastname,
            "url_image": avatar_url,
        }

        await create_user(payload)

    # Получаем текст из настроек
    start_text_raw = await fetch_setting("start_text")

    variables = {
        "firstname": firstname,
        "username": username,
    }

    # Дефолтный текст если настройка не задана или пустая
    if not start_text_raw or start_text_raw.strip() == "TEXT:" or len(start_text_raw.strip()) < 10:
        start_text_raw = """TEXT:
💎 <b>Добро пожаловать в Clicker Diamond!</b>

Привет, {firstname}! 

Кликай по алмазу, зарабатывай кристаллы и прокачивай свой аккаунт!

BUTTONS:
🚀 Играть|webapp"""

    main_text, keyboard = render_start_message(start_text_raw, variables)

    # Если текст пустой после рендера - используем дефолт
    if not main_text or not main_text.strip():
        main_text = f"💎 Добро пожаловать, {firstname}!\n\nНажми кнопку ниже, чтобы начать играть!"
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[[
                InlineKeyboardButton(
                    text="🚀 Играть",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]]
        )

    # Отправляем сообщение (без баннера, т.к. его нет)
    await bot.send_message(
        chat_id=message.chat.id,
        text=main_text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )


# ================== START ==================

async def main():
    print("🤖 Bot started!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
