from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Language(Base):
    __tablename__ = "languages"
    code = Column(String, primary_key=True)

    translations = relationship(
        "LanguageTranslation", back_populates="language", cascade="all, delete"
    )


class LanguageTranslation(Base):
    __tablename__ = "language_translations"

    id = Column(Integer, primary_key=True)
    language_code = Column(String, ForeignKey("languages.code", ondelete="CASCADE"))
    locale = Column(String, nullable=False)
    name = Column(String, nullable=False)

    language = relationship("Language", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("language_code", "locale", name="uq_language_locale"),
    )
