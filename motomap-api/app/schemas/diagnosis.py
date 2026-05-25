import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class DiagnosedPart(BaseModel):
    part_id: uuid.UUID | None = None
    name: str
    issue: str
    severity: Literal["SAFE", "CAUTION", "STOP"]
    confidence: float


class DiagnosisResult(BaseModel):
    diagnosis_id: uuid.UUID
    bike_id: uuid.UUID
    overall_confidence: float
    safe_to_ride: bool | None
    low_confidence_warning: str | None
    diagnosed_parts: list[DiagnosedPart]
    mechanic_prompt: str | None
    raw_analysis: str
    created_at: datetime
