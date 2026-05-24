import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_role
from app.database import get_db
from app.models.contribution import Contribution, ContributionStatus
from app.models.user import User, UserRole
from app.schemas.common import ok, paginated
from app.schemas.contribution import ContributionOut, ContributionReview, ContributionSubmit

router = APIRouter(prefix="/contributions", tags=["contributions"])

_expert_dep = require_role(UserRole.EXPERT_REVIEWER)


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_contribution(
    body: ContributionSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Submit a community contribution (any authenticated user)."""
    contrib = Contribution(
        contributor_id=current_user.id,
        content_type=body.content_type,
        content_id=body.content_id,
        data=body.data,
        status=ContributionStatus.PENDING,
    )
    db.add(contrib)
    await db.commit()
    await db.refresh(contrib)
    return ok(ContributionOut.model_validate(contrib).model_dump())


@router.get("")
async def list_contributions(
    status_filter: ContributionStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _reviewer: User = Depends(_expert_dep),
) -> dict:
    """List contributions (expert queue — requires EXPERT_REVIEWER+)."""
    stmt = select(Contribution)
    if status_filter:
        stmt = stmt.where(Contribution.status == status_filter)
    stmt = stmt.order_by(Contribution.created_at.asc())

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    contribs = (
        await db.execute(stmt.offset((page - 1) * per_page).limit(per_page))
    ).scalars().all()

    return paginated(
        [ContributionOut.model_validate(c).model_dump() for c in contribs], total, page, per_page
    )


def _get_reviewable(contrib: Contribution) -> None:
    """Raise if contribution cannot be reviewed."""
    if contrib.status in (ContributionStatus.APPROVED, ContributionStatus.REJECTED):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "ALREADY_REVIEWED",
                "message": f"Contribution is already {contrib.status.value}",
            },
        )


@router.post("/{contribution_id}/approve")
async def approve_contribution(
    contribution_id: uuid.UUID,
    body: ContributionReview = ContributionReview(),
    db: AsyncSession = Depends(get_db),
    reviewer: User = Depends(_expert_dep),
) -> dict:
    """Approve a contribution (EXPERT_REVIEWER+)."""
    contrib = (
        await db.execute(select(Contribution).where(Contribution.id == contribution_id))
    ).scalar_one_or_none()
    if not contrib:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "CONTRIBUTION_NOT_FOUND", "message": "Contribution not found"},
        )
    _get_reviewable(contrib)
    contrib.status = ContributionStatus.APPROVED
    contrib.reviewer_id = reviewer.id
    contrib.review_notes = body.review_notes
    await db.commit()
    await db.refresh(contrib)
    return ok(ContributionOut.model_validate(contrib).model_dump())


@router.post("/{contribution_id}/reject")
async def reject_contribution(
    contribution_id: uuid.UUID,
    body: ContributionReview = ContributionReview(),
    db: AsyncSession = Depends(get_db),
    reviewer: User = Depends(_expert_dep),
) -> dict:
    """Reject a contribution (EXPERT_REVIEWER+)."""
    contrib = (
        await db.execute(select(Contribution).where(Contribution.id == contribution_id))
    ).scalar_one_or_none()
    if not contrib:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "CONTRIBUTION_NOT_FOUND", "message": "Contribution not found"},
        )
    _get_reviewable(contrib)
    contrib.status = ContributionStatus.REJECTED
    contrib.reviewer_id = reviewer.id
    contrib.review_notes = body.review_notes
    await db.commit()
    await db.refresh(contrib)
    return ok(ContributionOut.model_validate(contrib).model_dump())
