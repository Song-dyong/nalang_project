from app.core.config import settings
from livekit import api
from livekit.api import LiveKitAPI, ListRoomsRequest, DeleteRoomRequest
from app.db.redis import redis_client
from fastapi import HTTPException


def create_access_token(identity: str, room_name: str) -> str:
    token = (
        api.AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_name(identity)
        .with_grants(api.VideoGrants(room_join=True, room=room_name))
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
