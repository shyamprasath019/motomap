import enum
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class RiskLevel(str, enum.Enum):
    SAFE = "SAFE"
    CAUTION = "CAUTION"
    STOP = "STOP"


class Part(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "parts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bike_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bikes.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    function: Mapped[str] = mapped_column(Text, nullable=False)
    failure_consequences: Mapped[str] = mapped_column(Text, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False)
    diy_fixable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    quick_fix: Mapped[str | None] = mapped_column(Text, nullable=True)
    cost_range_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cost_range_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    # NEVER set True without Expert Reviewer sign-off (see CLAUDE.md safety rules)
    is_risk_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(384), nullable=True)


class PartConnection(Base, TimestampMixin):
    __tablename__ = "part_connections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_part_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("parts.id"), nullable=False, index=True
    )
    to_part_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("parts.id"), nullable=False, index=True
    )
    connection_type: Mapped[str] = mapped_column(String(50), nullable=False)
