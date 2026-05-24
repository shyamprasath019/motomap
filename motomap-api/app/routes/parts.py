import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.part import Part, PartConnection
from app.schemas.common import ok
from app.schemas.part import PartConnectionOut, PartOut

router = APIRouter(prefix="/parts", tags=["parts"])


@router.get("/{part_id}/connections")
async def get_connections(part_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> dict:
    """Return all parts connected to the given part (anatomy graph edges)."""
    part = (
        await db.execute(
            select(Part).where(Part.id == part_id, Part.deleted_at.is_(None))
        )
    ).scalar_one_or_none()
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PART_NOT_FOUND", "message": "Part not found"},
        )

    connections = (
        await db.execute(
            select(PartConnection).where(
                or_(
                    PartConnection.from_part_id == part_id,
                    PartConnection.to_part_id == part_id,
                )
            )
        )
    ).scalars().all()

    result = []
    for conn in connections:
        other_id = conn.to_part_id if conn.from_part_id == part_id else conn.from_part_id
        other = (
            await db.execute(
                select(Part).where(Part.id == other_id, Part.deleted_at.is_(None))
            )
        ).scalar_one_or_none()
        entry = PartConnectionOut.model_validate(conn)
        entry.connected_part = PartOut.model_validate(other) if other else None
        result.append(entry.model_dump())

    return ok(result)
