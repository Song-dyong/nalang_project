from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.user.models.users import User
from app.domains.user.models.interest import Interest, UserInterest
from app.domains.user.models.language import Language, UserLanguage
from app.domains.user.models.gender import Gender, UserGender
from app.domains.user.schemas import UserProfileUpdate, UserProfileOut
from sqlalchemy.orm import joinedload
from sqlalchemy.future import select


async def update_user_profile(db: AsyncSession, user: User, data: UserProfileUpdate):
    # 🔸 기존 관심사 삭제
    for link in user.interest_links:
        await db.delete(link)
    user.interest_links = []

    # 🔸 기존 언어 삭제
    for link in user.language_links:
        await db.delete(link)
    user.language_links = []

    # 🔸 기존 성별 삭제
    for link in user.gender_links:
        await db.delete(link)
    user.gender_links = []

    # ✅ 새로운 관심사 추가
    for interest_id in data.interests:
        interest = await db.get(Interest, interest_id)
        if not interest:
            raise HTTPException(
                status_code=404, detail=f"Interest ID {interest_id} not found"
            )
        user.interest_links.append(UserInterest(user=user, interest=interest))

    # ✅ 새로운 언어 추가
    for language_id in data.languages:
        lang = await db.get(Language, language_id)
        if not lang:
            raise HTTPException(
                status_code=404, detail=f"Language ID {language_id} not found"
            )
        user.language_links.append(UserLanguage(user=user, language=lang))

    # ✅ 새로운 성별 추가 (optional)
    if data.gender_id:
        gender = await db.get(Gender, data.gender_id)
        if not gender:
            raise HTTPException(
                status_code=404, detail=f"Gender ID {data.gender_id} not found"
            )
        user.gender_links.append(UserGender(user=user, gender=gender))

    # 커밋 및 갱신
    try:
        await db.commit()
        await db.refresh(user)
    except Exception as e:
        print("DB COMMIT ERROR : ", e)
        await db.rollback()
        raise


def translate(translations, locale: str) -> str:
    for t in translations:
        if t.locale == locale:
            return t.name
    return translations[0].name if translations else ""


async def get_user_profile(db: AsyncSession, user: User, lang: str) -> UserProfileOut:
    interests = [
        translate(link.interest.translations, lang) for link in user.interest_links
    ]

    languages = [
        translate(link.language.translations, lang) for link in user.language_links
    ]

    gender = None
    if user.gender_links:
        gender_translations = user.gender_links[0].gender.translations
        gender = translate(gender_translations, lang)

    return UserProfileOut(
        name=user.name,
        email=user.email,
        interests=interests,
        languages=languages,
        gender=gender,
        image_path=user.profile_image,
    )


async def get_full_user_with_relations(db: AsyncSession, user_id: int) -> User:
    stmt = (
        select(User)
        .options(
            joinedload(User.interest_links)
            .joinedload(UserInterest.interest)
            .joinedload(Interest.translations),
            joinedload(User.language_links)
            .joinedload(UserLanguage.language)
            .joinedload(Language.translations),
            joinedload(User.gender_links)
            .joinedload(UserGender.gender)
            .joinedload(Gender.translations),
        )
        .where(User.id == user_id)
    )
    result = await db.execute(stmt)
    return result.unique().scalar_one()
