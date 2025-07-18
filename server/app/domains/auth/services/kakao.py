import httpx
from fastapi import Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.domains.user.crud import get_user_by_email, create_user
from app.core.security import create_access_token, create_refresh_token
from app.db.redis import redis_client
from app.domains.auth.schemas import RegisterRequest

KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"


def get_kakao_login_url() -> str:
    return (
        f"{KAKAO_AUTH_URL}?response_type=code"
        f"&client_id={settings.KAKAO_CLIENT_ID}"
        f"&redirect_uri={settings.KAKAO_REDIRECT_URI}"
    )


async def handle_kakao_callback(request: Request, db: AsyncSession):
    code = request.query_params.get("code")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            KAKAO_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "client_id": settings.KAKAO_CLIENT_ID,
                "redirect_uri": settings.KAKAO_REDIRECT_URI,
                "code": code,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
        )
        token_json = token_resp.json()
        access_token = token_json["access_token"]

        profile_resp = await client.get(
            KAKAO_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"}
        )
        profile = profile_resp.json()

    kakao_account = profile.get("kakao_account", {})
    email = kakao_account.get("email", f'{profile["id"]}@kakao.com')
    name = kakao_account.get("profile", {}).get("nickname", "Unknown")
    profile_image = kakao_account.get("profile", {}).get("profile_image_url", None)

    existing_user = await get_user_by_email(db, email)
    if existing_user:
        user = existing_user
    else:
        user_data = RegisterRequest(
            email=email,
            name=name,
            password=None,
            provider="kakao",
            profile_image=profile_image,
        )
        user = await create_user(db, user_data)

    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})

    await redis_client.set(refresh, str(user.id), ex=60 * 60 * 24 * 7)

    return RedirectResponse(
        f"{settings.FRONT_REDIRECT_URL}?access_token={access}&refresh_token={refresh}"
    )
