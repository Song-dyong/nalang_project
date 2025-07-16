from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Table
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Gender(Base):
    __tablename__ = "genders"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)  # 예: "male", "female", "other"

    translations = relationship(
        "GenderTranslation", back_populates="gender", cascade="all, delete"
    )
    user_links = relationship("UserGender", back_populates="gender")


class GenderTranslation(Base):
    __tablename__ = "gender_translations"

    id = Column(Integer, primary_key=True)
    gender_id = Column(Integer, ForeignKey("genders.id", ondelete="CASCADE"))
    locale = Column(String, nullable=False)
    name = Column(String, nullable=False)

    gender = relationship("Gender", back_populates="translations")

    __table_args__ = (UniqueConstraint("gender_id", "locale", name="uq_gender_locale"),)


class UserGender(Base):
    __tablename__ = "user_genders"
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    gender_id = Column(
        Integer, ForeignKey("genders.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="gender_links")
    gender = relationship("Gender", back_populates="user_links")
