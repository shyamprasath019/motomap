import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.contribution import ContributionStatus


class ContributionSubmit(BaseModel):
    content_type: str
    content_id: uuid.UUID | None = None
    data: dict[str, Any]


class ContributionReview(BaseModel):
    review_notes: str | None = None


class ContributionOut(BaseModel):
    id: uuid.UUID
    contributor_id: uuid.UUID
    content_type: str
    content_id: uuid.UUID | None
    status: ContributionStatus
    data: dict[str, Any]
    diff: dict[str, Any] | None
    reviewer_id: uuid.UUID | None
    review_notes: str | None
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}
