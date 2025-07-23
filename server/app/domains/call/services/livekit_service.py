from app.core.config import settings
from livekit import api


def create_access_token(identity: str, room_name: str) -> str:
    token = (
        api.AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_name(identity)
        .with_grants(api.VideoGrants(room_join=True, room=room_name))
    )
    return token.to_jwt()
