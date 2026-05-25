import asyncio
import functools
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.part import Part
from app.schemas.part import PartOut

if TYPE_CHECKING:
    from fastembed import TextEmbedding

EMBEDDING_DIM = 384
_MODEL_NAME = "BAAI/bge-small-en-v1.5"
_model: "TextEmbedding | None" = None


def _load_model() -> "TextEmbedding":
    global _model
    if _model is None:
        from fastembed import TextEmbedding  # lazy — downloads ~33 MB on first call

        _model = TextEmbedding(model_name=_MODEL_NAME)
    return _model


def _embed_sync(text_input: str) -> list[float]:
    model = _load_model()
    return list(next(model.embed([text_input])))


async def embed(text_input: str) -> list[float]:
    """Generate a 384-dim embedding vector, offloaded to thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, functools.partial(_embed_sync, text_input))


def _part_text(part: Part) -> str:
    """Concatenate the most semantically rich fields for embedding."""
    parts = [part.name, part.category, part.function, part.failure_consequences]
    if part.quick_fix:
        parts.append(part.quick_fix)
    return " ".join(parts)


async def index_part(part: Part, db: AsyncSession) -> None:
    """Compute and store the embedding for a single part."""
    vector = await embed(_part_text(part))
    vector_literal = "[" + ",".join(str(v) for v in vector) + "]"
    await db.execute(
        text("UPDATE parts SET embedding = :vec::vector WHERE id = :id"),
        {"vec": vector_literal, "id": str(part.id)},
    )
    await db.commit()


async def index_all_parts(db: AsyncSession) -> int:
    """Reindex all non-deleted parts. Returns count of indexed parts."""
    parts = (
        await db.execute(select(Part).where(Part.deleted_at.is_(None)))
    ).scalars().all()

    for part in parts:
        vector = await embed(_part_text(part))
        vector_literal = "[" + ",".join(str(v) for v in vector) + "]"
        await db.execute(
            text("UPDATE parts SET embedding = :vec::vector WHERE id = :id"),
            {"vec": vector_literal, "id": str(part.id)},
        )

    await db.commit()
    return len(parts)


async def semantic_search(
    query: str,
    db: AsyncSession,
    bike_id: uuid.UUID | None = None,
    top_k: int = 5,
) -> list[PartOut]:
    """Return top_k parts most semantically similar to query string."""
    vector = await embed(query)
    vector_literal = "[" + ",".join(str(v) for v in vector) + "]"

    bike_filter = "AND bike_id = :bike_id" if bike_id else ""
    params: dict = {"vec": vector_literal, "top_k": top_k}
    if bike_id:
        params["bike_id"] = str(bike_id)

    rows = (
        await db.execute(
            text(
                f"""
                SELECT id FROM parts
                WHERE deleted_at IS NULL
                  AND embedding IS NOT NULL
                  {bike_filter}
                ORDER BY embedding <=> :vec::vector
                LIMIT :top_k
                """
            ),
            params,
        )
    ).fetchall()

    if not rows:
        return []

    part_ids = [r[0] for r in rows]
    parts = (
        await db.execute(select(Part).where(Part.id.in_(part_ids)))
    ).scalars().all()

    order = {str(pid): i for i, pid in enumerate(part_ids)}
    parts_sorted = sorted(parts, key=lambda p: order.get(str(p.id), 999))
    return [PartOut.model_validate(p) for p in parts_sorted]
