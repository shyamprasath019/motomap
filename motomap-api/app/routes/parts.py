import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.part import Part, PartConnection
from app.schemas.common import ok
from app.schemas.part import PartConnectionOut, PartOut
from app.services import embeddings as embedding_service

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

    id_to_conn: dict[uuid.UUID, object] = {
        (conn.to_part_id if conn.from_part_id == part_id else conn.from_part_id): conn
        for conn in connections
    }

    parts_map: dict[uuid.UUID, Part] = {}
    if id_to_conn:
        other_parts = (
            await db.execute(
                select(Part).where(
                    Part.id.in_(id_to_conn.keys()),
                    Part.deleted_at.is_(None),
                )
            )
        ).scalars().all()
        parts_map = {p.id: p for p in other_parts}

    result = []
    for other_id, conn in id_to_conn.items():
        entry = PartConnectionOut.model_validate(conn)
        other = parts_map.get(other_id)
        entry.connected_part = PartOut.model_validate(other) if other else None
        result.append(entry.model_dump())

    return ok(result)


@router.get("/search")
async def search_parts(
    q: Annotated[str, Query(min_length=2, max_length=200)],
    bike_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Semantic search over parts using pgvector cosine similarity.

    Returns the top 5 parts most relevant to the query string.
    Optionally filter results to a specific bike with `bike_id`.
    Parts must be indexed (have an embedding stored) to appear in results.
    """
    results = await embedding_service.semantic_search(query=q, db=db, bike_id=bike_id)
    return ok([p.model_dump() for p in results])
