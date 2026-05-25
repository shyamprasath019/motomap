from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+asyncpg://motomap:motomap@localhost:5432/motomap"
    test_database_url: str = "postgresql+asyncpg://motomap:motomap@localhost:5432/motomap_test"
    redis_url: str = "redis://localhost:6379"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    jwt_secret: str = Field("changeme-dev-secret-32-chars-min!!", min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours
    cors_origins: list[str] = ["http://localhost:3000"]

    # Anthropic — AI diagnosis (claude-sonnet-4-6 vision)
    anthropic_api_key: str = ""

    # Cloudflare R2 — part + guide photo storage (S3-compatible)
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "motomap"
    r2_public_url: str = ""  # e.g. https://pub-<hash>.r2.dev


settings = Settings()
