from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Interest(Base):
    __tablename__ = "interests"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

    translations = relationship(
        "InterestTranslation", back_populates="interest", cascade="all, delete"
    )
    user_links = relationship("UserInterest", back_populates="interest")


class InterestTranslation(Base):
    __tablename__ = "interest_translations"

    id = Column(Integer, primary_key=True)
    interest_id = Column(Integer, ForeignKey("interests.id", ondelete="CASCADE"))
    locale = Column(String, nullable=False)
    name = Column(String, nullable=False)

    interest = relationship("Interest", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("interest_id", "locale", name="uq_interest_locale"),
    )


class UserInterest(Base):
    __tablename__ = "user_interests"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    interest_id = Column(
        Integer, ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True
    )

    user = relationship("User", back_populates="interest_links")
    interest = relationship("Interest", back_populates="user_links")
