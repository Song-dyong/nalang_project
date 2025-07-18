from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.domains.user.models.interest import Interest, InterestTranslation
from app.domains.user.models.language import Language, LanguageTranslation
from app.domains.user.models.gender import Gender, GenderTranslation
from app.domains.user.schemas import SetUpOption


async def get_interests_by_locale(db: AsyncSession, locale: str) -> list[SetUpOption]:
    stmt = (
        select(Interest.id, InterestTranslation.name)
        .join(InterestTranslation)
        .where(InterestTranslation.locale == locale)
        .order_by(Interest.id)
    )
    result = await db.execute(stmt)
    rows = result.all()

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No Interests List"
        )

    return [SetUpOption(id=row.id, name=row.name) for row in rows]


async def get_languages_by_locale(db: AsyncSession, locale: str) -> list[SetUpOption]:
    stmt = (
        select(Language.id, LanguageTranslation.name)
        .join(LanguageTranslation)
        .where(LanguageTranslation.locale == locale)
        .order_by(Language.id)
    )

    result = await db.execute(stmt)
    rows = result.all()

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No Languages List"
        )
    return [SetUpOption(id=row.id, name=row.name) for row in rows]


async def get_genders_by_locale(db: AsyncSession, locale: str) -> list[SetUpOption]:
    stmt = (
        select(Gender.id, GenderTranslation.name)
        .join(GenderTranslation)
        .where(GenderTranslation.locale == locale)
        .order_by(Gender.id)
    )
    result = await db.execute(stmt)
    rows = result.all()

    if not rows:
        raise HTTPException(status_code=404, detail="No genders found")

    return [SetUpOption(id=row.id, name=row.name) for row in rows]
