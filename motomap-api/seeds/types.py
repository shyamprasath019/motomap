"""Shared dataclass types for seed data definitions."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class PartDef:
    name: str
    category: str  # fuel | air_intake | cooling | brakes | electrical | drivetrain | exhaust | suspension | bodywork
    function: str
    failure_consequences: str
    risk_level: str  # SAFE | CAUTION | STOP
    diy_fixable: bool
    quick_fix: Optional[str]
    cost_min: int
    cost_max: int
    connections_to: list[tuple[str, str]] = field(default_factory=list)  # (target_part_name, connection_type)
    metadata: Optional[dict] = None


@dataclass
class BikeDef:
    slug: str
    make: str
    model: str
    year_start: int
    year_end: Optional[int]
    variant: Optional[str]
    metadata: Optional[dict]


@dataclass
class StepDef:
    step_number: int
    title: str
    description: str
    warning: Optional[str] = None


@dataclass
class GuideDef:
    bike_slug: str
    part_name: str  # matched to PartDef.name to look up part_id after insert
    title: str
    difficulty: str  # BEGINNER | INTERMEDIATE | ADVANCED
    estimated_minutes: int
    tools_required: list[str]
    steps: list[StepDef]
