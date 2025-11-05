from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    project_name: str = "Lost and Found API"
    environment: str = Field(default="development")
    firebase_project_id: str
    firebase_client_email: str
    firebase_private_key: str
    firestore_emulator_host: Optional[str] = None
    storage_bucket: Optional[str] = None

    class Config:
        env_file = "../.env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
