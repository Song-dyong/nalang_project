from fastapi import APIRouter, Depends
from app.domains.call.services.livekit_service import (
    create_access_token,
    register_for_call_queue,
    list_room,
    delete_room_in_livekit,
)
from app.domains.user.models.users import User
from app.domains.auth.deps import get_current_user
from app.domains.call.schemas import TokenRequest
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.domains.call.schemas import CallHistoryCreate
from app.domains.call.services.livekit_service import create_call_history_with_check

router = APIRouter()


@router.post("/token")
def get_call_token(req: TokenRequest, current_user: User = Depends(get_current_user)):
    token = create_access_token(identity=str(current_user.email), room_name=req.room)
    return {"access_token": token}


@router.post("/waiting")
async def register_for_call_waiting(current_user: User = Depends(get_current_user)):
    status = await register_for_call_queue(current_user.id)
    return {"status": status}


@router.delete("/room/{room_name}")
async def delete_room_api(room_name: str):
    return await delete_room_in_livekit(room_name)


@router.get("/room/test")
async def room_test():
    await list_room()


@router.post("/record")
async def record_call(
    history_data: CallHistoryCreate, db: AsyncSession = Depends(get_db)
):
    return await create_call_history_with_check(db, history_data)
