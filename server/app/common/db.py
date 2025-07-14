from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.common.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session