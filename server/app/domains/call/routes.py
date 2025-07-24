from fastapi import APIRouter, Depends
from app.domains.call.services.livekit_service import (
    create_access_token,
    register_for_call_queue,
)
from app.domains.user.models.users import User
from app.domains.auth.deps import get_current_user
from app.domains.call.schemas import TokenRequest

router = APIRouter()


@router.post("/token")
def get_call_token(req: TokenRequest, current_user: User = Depends(get_current_user)):
    token = create_access_token(identity=str(current_user.email), room_name=req.room)
    return {"access_token": token}


@router.post("/waiting")
async def register_for_call_waiting(current_user: User = Depends(get_current_user)):
    status = await register_for_call_queue(current_user.id)
    return {"status": status}


