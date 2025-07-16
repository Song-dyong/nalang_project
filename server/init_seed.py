import asyncio
from app.db.database import get_db
from app.domains.user.models.users import User  # 👈 이거 반드시 필요
from app.domains.user.models.language import Language, LanguageTranslation
from app.domains.user.models.interest import Interest, InterestTranslation


async def seed():
    async for session in get_db():
        lang_ko = Language(code="ko")
        lang_en = Language(code="en")
        lang_ja = Language(code="ja")
        session.add_all([lang_ko, lang_en, lang_ja])
        await session.flush()

        session.add_all(
            [
                LanguageTranslation(language_code="ko", locale="ko", name="한국어"),
                LanguageTranslation(language_code="ko", locale="en", name="Korean"),
                LanguageTranslation(language_code="ko", locale="ja", name="韓国語"),
                LanguageTranslation(language_code="en", locale="ko", name="영어"),
                LanguageTranslation(language_code="en", locale="en", name="English"),
                LanguageTranslation(language_code="en", locale="ja", name="英語"),
                LanguageTranslation(language_code="ja", locale="ko", name="일본어"),
                LanguageTranslation(language_code="ja", locale="en", name="Japanese"),
                LanguageTranslation(language_code="ja", locale="ja", name="日本語"),
            ]
        )

        interest_sports = Interest(name="sports")
        interest_music = Interest(name="music")
        interest_travel = Interest(name="travel")
        session.add_all([interest_sports, interest_music, interest_travel])
        await session.flush()

        session.add_all(
            [
                InterestTranslation(interest_name="sports", locale="ko", name="스포츠"),
                InterestTranslation(interest_name="sports", locale="en", name="Sports"),
                InterestTranslation(
                    interest_name="sports", locale="ja", name="スポーツ"
                ),
                InterestTranslation(interest_name="music", locale="ko", name="음악"),
                InterestTranslation(interest_name="music", locale="en", name="Music"),
                InterestTranslation(interest_name="music", locale="ja", name="音楽"),
                InterestTranslation(interest_name="travel", locale="ko", name="여행"),
                InterestTranslation(interest_name="travel", locale="en", name="Travel"),
                InterestTranslation(interest_name="travel", locale="ja", name="旅行"),
            ]
        )

        await session.commit()
        print("✅ Seed 완료")


if __name__ == "__main__":
    asyncio.run(seed())
