from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.common.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    name = Column(String, nullable=False)
    profile_image = Column(String, nullable=True)
    provider = Column(String, default="local")
    created_at = Column(DateTime, default=datetime.now)
