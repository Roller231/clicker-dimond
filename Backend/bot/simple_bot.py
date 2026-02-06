"""
Simple Telegram Bot for Clicker Diamond
Sends start message with WebApp button
"""
import asyncio
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = "8304448437:AAEO-hnljONqjwoPg7f5jxK9pb9gknXV520"
WEBAPP_URL = "https://clicker-dimond.vercel.app/"

bot = Bot(BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start_handler(message: Message):
    """Handle /start command."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[[
            InlineKeyboardButton(
                text="💎 Открыть игру",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]]
    )
    
    await message.answer(
        f"👋 Привет, <b>{message.from_user.first_name}</b>!\n\n"
        "💎 Добро пожаловать в <b>Clicker Diamond</b>!\n\n"
        "Кликай по алмазу, зарабатывай кристаллы и прокачивай свой аккаунт!\n\n"
        "Нажми кнопку ниже, чтобы начать играть 👇",
        reply_markup=keyboard,
        parse_mode="HTML"
    )


async def main():
    print("🤖 Simple Bot started!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
