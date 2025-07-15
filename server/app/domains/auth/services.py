from fastapi import HTTPException, status
from app.core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.user.crud import get_user_by_email
from app.core.security import create_access_token, create_refresh_token
from app.db.redis import redis_client
from app.domains.auth.utils import verify_password
from app.domains.auth.schemas import TokenResponse
from jose import jwt, JWTError


async def login_user(email: str, password: str, db: AsyncSession):
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Credential"
        )

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    await redis_client.set(refresh_token, str(user.id), ex=7 * 24 * 60 * 60)

    return access_token, refresh_token


async def refresh_access_token(refresh_token: str) -> TokenResponse:
    try:
        payload = jwt.decode(
            refresh_token, settings.JWT_REFRESH_SECRET_KEY, algorithms=["HS256"]
        )
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    stored_user_id = await redis_client.get(refresh_token)
    if stored_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Mismatch Refresh Token"
        )

    new_access_token = create_access_token({"sub": user_id})
    return TokenResponse(
        access_token=new_access_token, refresh_token=refresh_token, token_type="bearer"
    )


async def logout_user(refresh_token: str) -> None:
    await redis_client.delete(refresh_token)
