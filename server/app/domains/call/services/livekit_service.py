from app.core.config import settings
from livekit import api
from app.db.redis import redis_client

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
