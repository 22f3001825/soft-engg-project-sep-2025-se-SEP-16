from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    SERVER_NAME: str = "Intellica"
    SERVER_HOST: Optional[str] = None
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Database
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @property
    def database_url(self) -> str:
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        return "sqlite:///./app/instance/intellica.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
