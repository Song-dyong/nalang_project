from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=30)
    password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str
