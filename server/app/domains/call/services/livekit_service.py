from app.core.config import settings
from livekit import api
from livekit.api import LiveKitAPI, ListRoomsRequest, DeleteRoomRequest
from app.db.redis import redis_client
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.call.schemas import CallHistoryCreate, CallHistoryList, AudioUrlUpdate
from app.domains.call.models.call_history import CallHistory
from app.domains.call.crud import create_call_history as crud
from app.domains.user.models.users import User
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import aliased, selectinload


def create_access_token(identity: str, room_name: str) -> str:
    token = (
        api.AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_name(identity)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_subscribe=True,
                can_publish=True,
                can_publish_data=True,
            )
        )
    )
    return token.to_jwt()


async def register_for_call_queue(user_id: int) -> str:
    key = f"call:waiting:{user_id}"

    exists = await redis_client.exists(key)
    if exists:
        return "already_waiting"

    await redis_client.set(key, "waiting", ex=600)
    return "waiting"


async def delete_room_in_livekit(room_name: str):
    print(f"🔥 Deleting room: {room_name}")

    try:
        async with LiveKitAPI(
            url=settings.LIVEKIT_URL,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
        ) as lkapi:
            await lkapi.room.delete_room(DeleteRoomRequest(room=room_name))
            return {"deleted": room_name}
    except Exception as e:
        print(f"❌ Error while deleting room '{room_name}':", e)
        raise HTTPException(status_code=500, detail=f"Failed to delete room: {str(e)}")


async def list_room():
    try:
        async with LiveKitAPI(
            url=settings.LIVEKIT_URL,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
        ) as lkapi:
            print("🔐 LiveKitAPI connected")

            response = await lkapi.room.list_rooms(ListRoomsRequest())
            print("✅ Response received")
            print("📦 Rooms:", response.rooms)

            return {"rooms": [room.name for room in response.rooms]}
    except Exception as e:
        print("❌ Error occurred:", str(e))
        return {"error": str(e)}


async def create_call_history_with_check(
    db: AsyncSession, history_data: CallHistoryCreate
) -> CallHistory:
    if history_data.duration_sec <= 0:
        raise HTTPException(
            status_code=404, detail=f"Failed create record, 0초 이상 필요"
        )
    return await crud(db, history_data)


async def get_history_list(user: User, db: AsyncSession) -> List[CallHistoryList]:
    Partner = aliased(User)

    result = await db.execute(
        select(CallHistory, Partner)
        .join(Partner, CallHistory.partner_id == Partner.id)
        .where(CallHistory.user_id == user.id)
        .order_by(CallHistory.created_at.desc())
    )

    rows = result.all()

    return [
        {
            "id": ch.id,
            "room_name": ch.room_name,
            "started_at": ch.started_at,
            "ended_at": ch.ended_at,
            "duration_sec": ch.duration_sec,
            "partner": {"id": p.id, "name": p.name, "profile_image": p.profile_image},
        }
        for ch, p in rows
    ]


async def update_audio_url(data: AudioUrlUpdate, db: AsyncSession) -> dict:
    result = await db.execute(
        update(CallHistory)
        .where(CallHistory.room_name == data.room_name)
        .values(recording_url=data.recording_url)
        .execution_options(synchronize_session=False)
    )

    await db.commit()

    return {"updated": int(result.rowcount or 0)}
