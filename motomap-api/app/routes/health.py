from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    """Health check — no auth required."""
    return {
        "data": {"status": "ok"},
        "meta": {
            "version": "1.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }
