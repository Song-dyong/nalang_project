from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    profile_image: Optional[str]
    provider: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    interests: List[int]
    languages: List[int]
    gender_id: Optional[int]


class UserProfileOut(BaseModel):
    name: str
    email: str
    interests: List[str]
    languages: List[str]
    gender: Optional[str]
