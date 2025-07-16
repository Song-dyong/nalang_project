import httpx
from fastapi import Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.domains.user.crud import get_user_by_email, create_user
from app.core.security import create_access_token, create_refresh_token
from app.db.redis import redis_client
from app.domains.auth.schemas import RegisterRequest

NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize"
NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token"
NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me"


def get_naver_login_url() -> str:
    return (
        f"{NAVER_AUTH_URL}?response_type=code"
        f"&client_id={settings.NAVER_CLIENT_ID}"
        f"&redirect_uri={settings.NAVER_REDIRECT_URI}"
        f"&state=xyz"
    )


async def handle_naver_callback(request: Request, db: AsyncSession):
    code = request.query_params.get("code")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            NAVER_TOKEN_URL,
            params={
                "grant_type": "authorization_code",
                "client_id": settings.NAVER_CLIENT_ID,
                "client_secret": settings.NAVER_CLIENT_SECRET,
                "code": code,
                "state": "xyz",
            },
        )
        token_data = token_resp.json()
        access_token = token_data["access_token"]

        userinfo_resp = await client.get(
            NAVER_PROFILE_URL, headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = userinfo_resp.json()["response"]

    print("user_info >>> ", user_info)

    email = user_info["email"]
    name = user_info["name"]
    profile_image = user_info["profile_image"]

    existing_user = await get_user_by_email(db, email)
    if existing_user:
        user = existing_user
    else:
        user_data = RegisterRequest(
            email=email,
            name=name,
            password=None,
            provider="naver",
            profile_image=profile_image,
        )
        user = await create_user(db, user_data)

    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})

    await redis_client.set(refresh, str(user.id), ex=60 * 60 * 24 * 7)

    return JSONResponse(
        {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}
    )
