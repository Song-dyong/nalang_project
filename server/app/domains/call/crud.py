from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.call.models.call_history import CallHistory
from app.domains.call.schemas import CallHistoryCreate


async def create_call_history(
    db: AsyncSession, history_data: CallHistoryCreate
) -> CallHistory:
    history = CallHistory(**history_data.model_dump())
    db.add(history)
    await db.commit()
    await db.refresh(history)
    return history
