import uuid
from datetime import datetime

from pydantic import BaseModel


class BikeOut(BaseModel):
    id: uuid.UUID
    make: str
    model: str
    year_start: int
    year_end: int | None
    variant: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
