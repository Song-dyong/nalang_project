from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base_class import Base
from app.domains.user.models.interest import user_interest_association
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

    interests = relationship(
        "Interest",
        secondary=user_interest_association,
        back_populates="users"
    )

