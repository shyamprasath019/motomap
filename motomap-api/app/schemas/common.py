from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Meta(BaseModel):
    version: str = "1.0.0"
    timestamp: str = Field(default_factory=_now_iso)


class MetaPaginated(Meta):
    total: int
    page: int
    per_page: int


def ok(data: Any, meta: Meta | None = None) -> dict:
    """Build standard success response."""
    return {"data": data, "meta": (meta or Meta()).model_dump()}


def paginated(data: list[Any], total: int, page: int, per_page: int) -> dict:
    """Build paginated success response."""
    return {
        "data": data,
        "meta": MetaPaginated(total=total, page=page, per_page=per_page).model_dump(),
    }
