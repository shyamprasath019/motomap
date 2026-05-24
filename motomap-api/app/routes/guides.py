import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.diy_guide import DIYGuide, GuideStep
from app.schemas.common import ok, paginated
from app.schemas.guide import GuideOut, GuideStepOut, GuideWithStepsOut

router = APIRouter(prefix="/guides", tags=["guides"])


@router.get("")
async def list_guides(
    bike_id: uuid.UUID | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List published guides, optionally filtered by bike."""
    stmt = select(DIYGuide).where(
        DIYGuide.deleted_at.is_(None), DIYGuide.is_published.is_(True)
    )
    if bike_id:
        stmt = stmt.where(DIYGuide.bike_id == bike_id)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    guides = (
        await db.execute(stmt.offset((page - 1) * per_page).limit(per_page))
    ).scalars().all()

    return paginated(
        [GuideOut.model_validate(g).model_dump() for g in guides], total, page, per_page
    )


@router.get("/{guide_id}")
async def get_guide(guide_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> dict:
    """Get a guide with all ordered steps."""
    guide = (
        await db.execute(
            select(DIYGuide).where(DIYGuide.id == guide_id, DIYGuide.deleted_at.is_(None))
        )
    ).scalar_one_or_none()
    if not guide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "GUIDE_NOT_FOUND", "message": "Guide not found"},
        )

    steps = (
        await db.execute(
            select(GuideStep)
            .where(GuideStep.guide_id == guide_id)
            .order_by(GuideStep.step_number)
        )
    ).scalars().all()

    out = GuideWithStepsOut.model_validate(guide)
    out.steps = [GuideStepOut.model_validate(s) for s in steps]
    return ok(out.model_dump())
