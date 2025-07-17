from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.user.models.language import Language, LanguageTranslation
from app.domains.user.models.interest import Interest, InterestTranslation
from app.domains.user.models.gender import Gender, GenderTranslation
from app.db.database import async_session
import asyncio
import app.db.metadata


async def seed_languages(db: AsyncSession):
    languages = [
        {"code": "en", "translations": {"en": "English", "ko": "영어", "ja": "英語"}},
        {
            "code": "ko",
            "translations": {"en": "Korean", "ko": "한국어", "ja": "韓国語"},
        },
        {
            "code": "ja",
            "translations": {"en": "Japanese", "ko": "일본어", "ja": "日本語"},
        },
    ]
    for lang_data in languages:
        lang = Language(code=lang_data["code"])
        db.add(lang)
        await db.flush()  # lang.id 확보용

        for locale, name in lang_data["translations"].items():
            db.add(LanguageTranslation(language_id=lang.id, locale=locale, name=name))


async def seed_interests(db: AsyncSession):
    interests = [
        {"translations": {"en": "Travel", "ko": "여행", "ja": "旅行"}},
        {"translations": {"en": "Music", "ko": "음악", "ja": "音楽"}},
        {"translations": {"en": "Sports", "ko": "스포츠", "ja": "スポーツ"}},
    ]
    for item in interests:
        interest = Interest(name=item["translations"]["en"])  # 원래 이름 (선택)
        db.add(interest)
        await db.flush()

        for locale, name in item["translations"].items():
            db.add(
                InterestTranslation(interest_id=interest.id, locale=locale, name=name)
            )


async def seed_genders(db: AsyncSession):
    genders = [
        {"code": "male", "translations": {"en": "Male", "ko": "남성", "ja": "男性"}},
        {
            "code": "female",
            "translations": {"en": "Female", "ko": "여성", "ja": "女性"},
        },
        {
            "code": "other",
            "translations": {"en": "Other", "ko": "기타", "ja": "その他"},
        },
    ]
    for item in genders:
        gender = Gender(code=item["code"])
        db.add(gender)
        await db.flush()

        for locale, name in item["translations"].items():
            db.add(GenderTranslation(gender_id=gender.id, locale=locale, name=name))


async def main():
    async with async_session() as db:
        await seed_interests(db)
        await seed_genders(db)
        await seed_languages(db)
        await db.commit()


if __name__ == "__main__":
    asyncio.run(main())
