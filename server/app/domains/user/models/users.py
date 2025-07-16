from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base_class import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    name = Column(String, nullable=False)
    profile_image = Column(String, nullable=True)
    provider = Column(String, default="local")
    created_at = Column(DateTime, default=datetime.now)

    interest_links = relationship(
        "UserInterest", back_populates="user", cascade="all, delete"
    )
    language_links = relationship(
        "UserLanguage", back_populates="user", cascade="all, delete"
    )
    gender_links = relationship(
        "UserGender", back_populates="user", cascade="all, delete"
    )
