from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import RedirectResponse

from app.db.database import get_db
from app.domains.auth.schemas import (
    RegisterRequest,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest,
    LogoutRequest,
)
from app.domains.user.crud import get_user_by_email, create_user
from app.domains.auth.services import login_user, refresh_access_token, logout_user
from app.domains.auth.services.google import (
    handle_google_callback,
    get_google_login_url,
)
from app.domains.auth.services.line import get_line_login_url, handle_line_callback
from app.domains.auth.services.kakao import get_kakao_login_url, handle_kakao_callback
from app.domains.auth.services.naver import get_naver_login_url, handle_naver_callback

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


@router.post("/logout", status_code=204)
async def logout(data: LogoutRequest):
    await logout_user(data.refresh_token)
    return {"message": "Logout Success!!"}


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


@router.get("/google/login")
async def google_login():
    return RedirectResponse(get_google_login_url())


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    return await handle_google_callback(request, db)


@router.get("/line/login")
async def line_login():
    return RedirectResponse(get_line_login_url())


@router.get("/line/callback")
async def line_callback(request: Request, db: AsyncSession = Depends(get_db)):
    return await handle_line_callback(request, db)


@router.get("/kakao/login")
async def kakao_login():
    return RedirectResponse(get_kakao_login_url())


@router.get("/kakao/callback")
async def kakao_callback(request: Request, db: AsyncSession = Depends(get_db)):
    return await handle_kakao_callback(request, db)


@router.get("/naver/login")
async def naver_login():
    return RedirectResponse(get_naver_login_url())


@router.get("/naver/callback")
async def naver_callback(request: Request, db: AsyncSession = Depends(get_db)):
    return await handle_naver_callback(request, db)
