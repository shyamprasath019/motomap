import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.diy_guide import Difficulty


class GuideStepOut(BaseModel):
    id: uuid.UUID
    guide_id: uuid.UUID
    step_number: int
    title: str
    description: str
    photo_url: str | None
    warning: str | None

    model_config = {"from_attributes": True}


class GuideOut(BaseModel):
    id: uuid.UUID
    bike_id: uuid.UUID
    part_id: uuid.UUID
    title: str
    difficulty: Difficulty
    estimated_minutes: int | None
    tools_required: list | None
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class GuideWithStepsOut(GuideOut):
    steps: list[GuideStepOut] = []
