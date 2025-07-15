from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.domains.auth.schemas import RegisterRequest, UserResponse
from app.domains.user.crud import get_user_by_email, create_user
from app.domains.auth.schemas import TokenResponse, RefreshTokenRequest
from app.domains.auth.services import login_user, refresh_access_token

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    access_token, refresh_token = await login_user(data.username, data.password, db)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/register", response_model=UserResponse)
async def register_user(user_in: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Existing Email"
        )

    user = await create_user(db, user_in)
    return user


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest):
    return await refresh_access_token(data.refresh_token)
