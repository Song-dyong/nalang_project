import redis.asyncio as redis
from app.common.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_response=True)
