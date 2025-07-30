from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.utils import upload_image_to_s3
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


@router.get("/{id}", response_model=UserProfileOut)
async def get_partner(
    id: int,
    db: AsyncSession = Depends(get_db),
    locale: str = Depends(get_locale),
):
    user_with_relations = await get_full_user_with_relations(db, id)
    return await get_user_profile(db, user_with_relations, locale)


@router.post("/me/profile")
async def save_profile(
    data: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        await update_user_profile(db, user, data)
        return {"message": "Profile updated successfully"}
    except Exception as e:
        print("Server Response Error", e)
        raise


@router.post("/me/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail="이미지 파일만 업로드할 수 있습니다."
        )

    image_url = await upload_image_to_s3(file, folder="profile_image")

    current_user.profile_image = image_url
    await db.commit()

    return {"image_url": image_url}


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
