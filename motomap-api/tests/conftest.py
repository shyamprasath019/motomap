import uuid
from collections.abc import AsyncGenerator

import bcrypt as _bcrypt_lib
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth.jwt import create_access_token
from app.config import settings
from app.database import get_db
from app.main import app
from app.models import Base, Bike, DIYGuide, GuideStep, Part, User
from app.models.contribution import Contribution, ContributionStatus
from app.models.diy_guide import Difficulty
from app.models.part import PartConnection as PartConn, RiskLevel
from app.models.user import UserRole

def _hash_pw(pw: str) -> str:
    return _bcrypt_lib.hashpw(pw.encode(), _bcrypt_lib.gensalt()).decode()


# ---------------------------------------------------------------------------
# Core DB fixtures — fresh engine per test to avoid cross-loop asyncpg issues
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def _engine():
    engine = create_async_engine(settings.test_database_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(_engine) -> AsyncGenerator[AsyncSession, None]:
    SessionLocal = async_sessionmaker(_engine, expire_on_commit=False)
    async with SessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """HTTP client for endpoints that don't need a DB session."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def db_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP client whose get_db is overridden with the test session."""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Domain fixtures
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def test_bike(db_session: AsyncSession) -> Bike:
    bike = Bike(
        make="Bajaj",
        model="Pulsar 150",
        year_start=2020,
        year_end=None,
        variant="Standard",
        is_active=True,
    )
    db_session.add(bike)
    await db_session.commit()
    await db_session.refresh(bike)
    return bike


@pytest_asyncio.fixture
async def test_part(db_session: AsyncSession, test_bike: Bike) -> Part:
    part = Part(
        bike_id=test_bike.id,
        name="Engine Oil",
        category="Lubrication",
        function="Lubricates engine internals",
        failure_consequences="Engine seizure",
        risk_level=RiskLevel.CAUTION,
        diy_fixable=True,
        quick_fix="Top up with 10W-30 oil",
        cost_range_min=200,
        cost_range_max=500,
        is_risk_approved=True,
    )
    db_session.add(part)
    await db_session.commit()
    await db_session.refresh(part)
    return part


@pytest_asyncio.fixture
async def test_part_b(db_session: AsyncSession, test_bike: Bike) -> Part:
    part = Part(
        bike_id=test_bike.id,
        name="Oil Filter",
        category="Lubrication",
        function="Filters engine oil",
        failure_consequences="Dirty oil circulates",
        risk_level=RiskLevel.CAUTION,
        diy_fixable=True,
        is_risk_approved=True,
    )
    db_session.add(part)
    await db_session.commit()
    await db_session.refresh(part)
    return part


@pytest_asyncio.fixture
async def test_connection(
    db_session: AsyncSession, test_part: Part, test_part_b: Part
) -> PartConn:
    conn = PartConn(
        from_part_id=test_part.id,
        to_part_id=test_part_b.id,
        connection_type="filters",
    )
    db_session.add(conn)
    await db_session.commit()
    await db_session.refresh(conn)
    return conn


@pytest_asyncio.fixture
async def test_guide(db_session: AsyncSession, test_bike: Bike, test_part: Part) -> DIYGuide:
    guide = DIYGuide(
        bike_id=test_bike.id,
        part_id=test_part.id,
        title="How to change engine oil",
        difficulty=Difficulty.BEGINNER,
        estimated_minutes=30,
        tools_required=["wrench", "drain pan"],
        is_published=True,
    )
    db_session.add(guide)
    await db_session.commit()
    await db_session.refresh(guide)
    return guide


@pytest_asyncio.fixture
async def test_guide_step(db_session: AsyncSession, test_guide: DIYGuide) -> GuideStep:
    step = GuideStep(
        guide_id=test_guide.id,
        step_number=1,
        title="Warm up the engine",
        description="Run engine for 2 minutes to thin the oil.",
        warning="Hot oil can burn — wait 5 minutes before draining.",
    )
    db_session.add(step)
    await db_session.commit()
    await db_session.refresh(step)
    return step


# ---------------------------------------------------------------------------
# Auth fixtures
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        email="rider@test.com",
        clerk_id="local_rider@test.com",
        display_name="Test Rider",
        role=UserRole.RIDER,
        password_hash=_hash_pw("testpass1"),
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def expert_user(db_session: AsyncSession) -> User:
    user = User(
        email="expert@test.com",
        clerk_id="local_expert@test.com",
        display_name="Expert Reviewer",
        role=UserRole.EXPERT_REVIEWER,
        password_hash=_hash_pw("expertpass1"),
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
def rider_headers(test_user: User) -> dict:
    token = create_access_token(test_user.id, test_user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
def expert_headers(expert_user: User) -> dict:
    token = create_access_token(expert_user.id, expert_user.role.value)
    return {"Authorization": f"Bearer {token}"}
