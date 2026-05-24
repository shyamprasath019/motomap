from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+asyncpg://motomap:motomap@localhost:5432/motomap"
    test_database_url: str = "postgresql+asyncpg://motomap:motomap@localhost:5432/motomap_test"
    redis_url: str = "redis://localhost:6379"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    jwt_secret: str = "changeme-dev-secret-32-chars-min!!"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours


settings = Settings()
