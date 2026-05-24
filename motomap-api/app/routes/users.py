import bcrypt as _bcrypt_lib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.common import ok
from app.schemas.user import TokenOut, UserLogin, UserOut, UserRegister

router = APIRouter(prefix="/users", tags=["users"])


def _hash(password: str) -> str:
    return _bcrypt_lib.hashpw(password.encode(), _bcrypt_lib.gensalt()).decode()


def _verify(plain: str, hashed: str) -> bool:
    return _bcrypt_lib.checkpw(plain.encode(), hashed.encode())


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)) -> dict:
    """Register a new user; returns JWT."""
    existing = (
        await db.execute(select(User).where(User.email == body.email))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "EMAIL_EXISTS", "message": "Email already registered"},
        )
    user = User(
        email=body.email,
        clerk_id=f"local_{body.email}",
        display_name=body.display_name,
        password_hash=_hash(body.password),
        role=UserRole.RIDER,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(user.id, user.role.value)
    return ok(TokenOut(access_token=token, user=UserOut.model_validate(user)).model_dump())


@router.post("/login")
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)) -> dict:
    """Authenticate and return JWT."""
    result = await db.execute(
        select(User).where(User.email == body.email, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not _verify(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"},
        )
    token = create_access_token(user.id, user.role.value)
    return ok(TokenOut(access_token=token, user=UserOut.model_validate(user)).model_dump())


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)) -> dict:
    """Return the authenticated user's profile."""
    return ok(UserOut.model_validate(current_user).model_dump())
