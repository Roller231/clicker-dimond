"""
Bot configuration
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from parent directory (Backend/.env)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8304448437:AAEO-hnljONqjwoPg7f5jxK9pb9gknXV520")
BOT_USERNAME = os.getenv("BOT_USERNAME", "DIMOND_DDDD_BOT")

# WebApp URL
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://clicker-dimond.vercel.app/")

# Admin Telegram IDs
ADMIN_TG_IDS = {
    1008871802,
}

# Database config
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "141722"),
    "db": os.getenv("DB_NAME", "clicker_diamond"),
    "autocommit": True,
    "charset": "utf8mb4"
}

# API URL
API_URL = os.getenv("API_URL", "http://localhost:8000")
