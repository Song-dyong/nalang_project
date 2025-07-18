from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_locale
from app.domains.auth.deps import get_current_user
from app.domains.user.models.users import User
from app.domains.user.schemas import UserProfileOut, UserProfileUpdate, SetUpOption
from app.domains.user.services import (
    update_user_profile,
    get_user_profile,
    get_full_user_with_relations,
)
from app.domains.user.services.setup import (
    get_genders_by_locale,
    get_interests_by_locale,
    get_languages_by_locale,
)
from app.db.database import get_db

router = APIRouter()


@router.get("/me", response_model=UserProfileOut)
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    locale: str = Depends(get_locale),
):
    user_with_relations = await get_full_user_with_relations(db, current_user.id)
    return await get_user_profile(db, user_with_relations, locale)


@router.post("/me/profile")
async def save_profile(
    data: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await update_user_profile(db, user, data)
    return {"message": "Profile updated successfully"}


@router.get("/setup/interests", response_model=list[SetUpOption])
async def get_interests(
    db: AsyncSession = Depends(get_db), locale: str = Depends(get_locale)
):
    return await get_interests_by_locale(db, locale)


@router.get("/setup/languages", response_model=list[SetUpOption])
async def get_languages(
    db: AsyncSession = Depends(get_db), locale: str = Depends(get_locale)
):
    return await get_languages_by_locale(db, locale)


@router.get("/setup/genders", response_model=list[SetUpOption])
async def get_genders(
    db: AsyncSession = Depends(get_db), locale: str = Depends(get_locale)
):
    return await get_genders_by_locale(db, locale)
