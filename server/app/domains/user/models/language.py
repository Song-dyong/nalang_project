from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)

    translations = relationship(
        "LanguageTranslation", back_populates="language", cascade="all, delete"
    )
    user_links = relationship("UserLanguage", back_populates="language")


class LanguageTranslation(Base):
    __tablename__ = "language_translations"

    id = Column(Integer, primary_key=True)
    language_id = Column(Integer, ForeignKey("languages.id", ondelete="CASCADE"))
    locale = Column(String, nullable=False)
    name = Column(String, nullable=False)

    language = relationship("Language", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("language_id", "locale", name="uq_language_locale"),
    )


class UserLanguage(Base):
    __tablename__ = "user_languages"
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    language_id = Column(
        Integer, ForeignKey("languages.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="language_links")
    language = relationship("Language", back_populates="user_links")
