from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.auth.schemas import RegisterRequest, UserResponse
from app.db.database import get_db
from app.domains.user.crud import get_user_by_email, create_user

router = APIRouter()


@router.post("/login")
async def login():
    return {"msg": "Login Endpoint"}


@router.post("/register", response_model=UserResponse)
async def register_user(user_in: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Existing Email"
        )

    user = await create_user(db, user_in)
    return user
