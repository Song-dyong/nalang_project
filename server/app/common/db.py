from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.common.config import settings
from sqlalchemy.ext.declarative import declarative_base
from typing import AsyncGenerator

Base = declarative_base()

engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
