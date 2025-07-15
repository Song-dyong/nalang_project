from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM
    )
