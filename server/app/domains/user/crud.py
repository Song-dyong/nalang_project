from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.domains.user.models import User
from app.domains.auth.utils import hash_password
from app.domains.auth.schemas import RegisterRequest


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_in: RegisterRequest) -> User:
    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_pwd,
        provider="local",
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
