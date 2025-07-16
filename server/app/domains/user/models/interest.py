from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Table
from sqlalchemy.orm import relationship
from app.db.base_class import Base

user_interest_association = Table(
    "user_interests",
    Base.metadata,
    Column(
        "user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "interest_name",
        String,
        ForeignKey("interests.name", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Interest(Base):
    __tablename__ = "interests"
    name = Column(String, primary_key=True)

    translations = relationship(
        "InterestTranslation", back_populates="interest", cascade="all, delete"
    )
    users = relationship(
        "User", secondary=user_interest_association, back_populates="interests"
    )


class InterestTranslation(Base):
    __tablename__ = "interest_translations"

    id = Column(Integer, primary_key=True)
    interest_name = Column(String, ForeignKey("interests.name", ondelete="CASCADE"))
    locale = Column(String, nullable=False)
    name = Column(String, nullable=False)

    interest = relationship("Interest", back_populates="translations")

    __table_args__ = (
        UniqueConstraint("interest_name", "locale", name="uq_interest_locale"),
    )
