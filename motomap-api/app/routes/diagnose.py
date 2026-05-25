import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.common import ok
from app.services import diagnosis as diagnosis_service

router = APIRouter(prefix="/diagnose", tags=["diagnosis"])

_ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
_MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("")
async def diagnose_bike(
    bike_id: uuid.UUID = Form(...),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> dict:
    """
    AI-powered visual diagnosis for a motorcycle.

    Upload a photo of a bike part; returns a structured diagnosis with confidence
    score, severity per part, and a mechanic prompt when safety issues are found.
    Confidence < 0.6 returns safe_to_ride=null with a low_confidence_warning.
    """
    content_type = image.content_type or "image/jpeg"
    if content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "INVALID_IMAGE_TYPE",
                "message": "Image must be JPEG, PNG, WebP, or HEIC",
            },
        )

    image_bytes = await image.read()
    if len(image_bytes) > _MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "code": "IMAGE_TOO_LARGE",
                "message": "Image must be under 10 MB",
            },
        )

    try:
        result = await diagnosis_service.diagnose(
            bike_id=bike_id,
            image_bytes=image_bytes,
            db=db,
            image_media_type=content_type,
        )
    except ValueError as exc:
        msg = str(exc)
        if "not found" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "BIKE_NOT_FOUND", "message": msg},
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "DIAGNOSIS_FAILED", "message": msg},
        )

    return ok(result.model_dump())
