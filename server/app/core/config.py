from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    REDIS_URL: str
    FIREBASE_PROJECT_ID: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
