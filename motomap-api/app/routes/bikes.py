import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.bike import Bike
from app.models.part import Part
from app.schemas.bike import BikeOut
from app.schemas.common import ok, paginated
from app.schemas.part import PartOut

router = APIRouter(prefix="/bikes", tags=["bikes"])


@router.get("")
async def list_bikes(
    make: str | None = Query(None),
    model: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List bikes with optional make/model filter."""
    stmt = select(Bike).where(Bike.deleted_at.is_(None), Bike.is_active.is_(True))
    if make:
        stmt = stmt.where(Bike.make.ilike(f"%{make}%"))
    if model:
        stmt = stmt.where(Bike.model.ilike(f"%{model}%"))

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    bikes = (await db.execute(stmt.offset((page - 1) * per_page).limit(per_page))).scalars().all()

    return paginated([BikeOut.model_validate(b).model_dump() for b in bikes], total, page, per_page)


@router.get("/{bike_id}")
async def get_bike(bike_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> dict:
    """Get a bike by ID."""
    bike = (
        await db.execute(select(Bike).where(Bike.id == bike_id, Bike.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not bike:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "BIKE_NOT_FOUND", "message": "Bike not found"},
        )
    return ok(BikeOut.model_validate(bike).model_dump())


@router.get("/{bike_id}/parts")
async def list_parts_for_bike(
    bike_id: uuid.UUID,
    category: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List parts for a bike."""
    bike = (
        await db.execute(select(Bike).where(Bike.id == bike_id, Bike.deleted_at.is_(None)))
    ).scalar_one_or_none()
    if not bike:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "BIKE_NOT_FOUND", "message": "Bike not found"},
        )

    stmt = select(Part).where(Part.bike_id == bike_id, Part.deleted_at.is_(None))
    if category:
        stmt = stmt.where(Part.category.ilike(f"%{category}%"))

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    parts = (await db.execute(stmt.offset((page - 1) * per_page).limit(per_page))).scalars().all()

    return paginated([PartOut.model_validate(p).model_dump() for p in parts], total, page, per_page)


@router.get("/{bike_id}/parts/{part_id}")
async def get_part_for_bike(
    bike_id: uuid.UUID, part_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> dict:
    """Get a specific part belonging to a bike."""
    part = (
        await db.execute(
            select(Part).where(
                Part.id == part_id,
                Part.bike_id == bike_id,
                Part.deleted_at.is_(None),
            )
        )
    ).scalar_one_or_none()
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PART_NOT_FOUND", "message": "Part not found"},
        )
    return ok(PartOut.model_validate(part).model_dump())
