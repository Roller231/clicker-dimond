from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:141722@localhost:3306/clicker_diamond"
    TELEGRAM_BOT_TOKEN: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"  # Игнорировать лишние переменные из .env


@lru_cache
def get_settings() -> Settings:
    return Settings()
