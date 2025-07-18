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
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    LINE_CLIENT_ID: str
    LINE_CLIENT_SECRET: str
    LINE_REDIRECT_URI: str
    KAKAO_CLIENT_ID: str
    KAKAO_REDIRECT_URI: str
    NAVER_CLIENT_ID: str
    NAVER_CLIENT_SECRET: str
    NAVER_REDIRECT_URI: str
    FRONT_REDIRECT_URL: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
