import httpx
from fastapi import Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.domains.auth.schemas import RegisterRequest
from app.domains.user.crud import create_user, get_user_by_email
from app.core.security import create_access_token, create_refresh_token
from app.db.redis import redis_client

LINE_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize"
LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token"
LINE_PROFILE_URL = "https://api.line.me/v2/profile"


def get_line_login_url() -> str:
    return (
        f"{LINE_AUTH_URL}?response_type=code"
        f"&client_id={settings.LINE_CLIENT_ID}"
        f"&redirect_uri={settings.LINE_REDIRECT_URI}"
        f"&scope=profile%20openid%20email"
        f"&state=xyz"
    )


async def handle_line_callback(request: Request, db: AsyncSession):
    code = request.query_params.get("code")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            LINE_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.LINE_REDIRECT_URI,
                "client_id": settings.LINE_CLIENT_ID,
                "client_secret": settings.LINE_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        token_json = token_resp.json()
        access_token = token_json["access_token"]

        profile_resp = await client.get(
            LINE_PROFILE_URL, headers={"Authorization": f"Bearer {access_token}"}
        )

        profile = profile_resp.json()

    email = f"{profile["userId"]}@line.com"
    name = profile["displayName"]
    profile_image = profile["pictureUrl"]

    existing_user = await get_user_by_email(db, email)
    if existing_user:
        user = existing_user
    else:
        user_data = RegisterRequest(
            email=email,
            name=name,
            password=None,
            provider="line",
            profile_image=profile_image,
        )
        user = await create_user(db, user_data)

    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})
    await redis_client.set(refresh, str(user.id), ex=60 * 60 * 24 * 7)

    return RedirectResponse(
        f"{settings.FRONT_REDIRECT_URL}?access_token={access}&refresh_token={refresh}"
    )
