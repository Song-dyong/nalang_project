from fastapi import APIRouter, Depends
from app.domains.user.models import User
from app.domains.user.schemas import UserOut
from app.domains.auth.deps import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
