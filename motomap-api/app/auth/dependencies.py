import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import decode_token
from app.database import get_db
from app.models.user import User, UserRole

_bearer = HTTPBearer()

_ROLE_ORDER = [
    UserRole.RIDER,
    UserRole.VERIFIED_ENTHUSIAST,
    UserRole.EXPERT_REVIEWER,
    UserRole.BRAND_OFFICIAL,
    UserRole.ADMIN,
]


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate JWT, return the corresponding User."""
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": "INVALID_TOKEN", "message": "Could not validate credentials"},
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(credentials.credentials)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise exc
    except JWTError:
        raise exc

    result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id_str), User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise exc
    return user


def require_role(min_role: UserRole):
    """Return a dependency that enforces minimum role level."""
    min_index = _ROLE_ORDER.index(min_role)

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if _ROLE_ORDER.index(current_user.role) < min_index:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_ROLE",
                    "message": f"Requires {min_role.value} or higher",
                },
            )
        return current_user

    return dependency
