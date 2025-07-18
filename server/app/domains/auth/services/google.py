import httpx
from fastapi import HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.domains.user.crud import get_user_by_email, create_user
from app.core.security import create_access_token, create_refresh_token
from app.db.redis import redis_client
from app.domains.auth.schemas import RegisterRequest
from urllib.parse import urlencode


def get_google_login_url() -> str:
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"

    query_params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }

    return f"{base_url}?{urlencode(query_params)}"


async def handle_google_callback(request: Request, db: AsyncSession) -> JSONResponse:
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Code not Provided"
        )

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            },
        )

    if token_resp.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Token request Failed",
        )

    token_data = token_resp.json()
    google_access_token = token_data["access_token"]

    async with httpx.AsyncClient() as client:
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        )

    if userinfo_resp.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google userinfo fetch Failed",
        )

    user_info = userinfo_resp.json()
    email = user_info["email"]
    name = user_info["name"]
    profile_image = user_info["picture"]
    user = await get_user_by_email(db, email)
    user_data = RegisterRequest(
        email=email,
        hashed_password=None,
        name=name,
        profile_image=profile_image,
        provider="google",
    )
    if not user:
        user = await create_user(db, user_data)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    await redis_client.set(refresh_token, str(user.id), ex=60 * 60 * 24 * 7)

    return RedirectResponse(
        f"{settings.FRONT_REDIRECT_URL}?access_token={access_token}&refresh_token={refresh_token}"
    )
