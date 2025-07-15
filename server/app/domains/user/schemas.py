from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    profile_image: Optional[str]
    provider: str
    created_at: datetime

    model_config = {"from_attributes": True}
