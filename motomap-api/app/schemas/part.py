import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.part import RiskLevel


class PartOut(BaseModel):
    id: uuid.UUID
    bike_id: uuid.UUID
    name: str
    category: str
    function: str
    failure_consequences: str
    risk_level: RiskLevel
    diy_fixable: bool
    quick_fix: str | None
    cost_range_min: int | None
    cost_range_max: int | None
    is_risk_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PartConnectionOut(BaseModel):
    id: uuid.UUID
    from_part_id: uuid.UUID
    to_part_id: uuid.UUID
    connection_type: str
    connected_part: PartOut | None = None

    model_config = {"from_attributes": True}
