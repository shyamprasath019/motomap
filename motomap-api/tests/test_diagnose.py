import uuid
from datetime import datetime, timezone
from io import BytesIO
from unittest.mock import AsyncMock, patch

from httpx import AsyncClient

from app.models import Bike, User
from app.schemas.diagnosis import DiagnosedPart, DiagnosisResult

_FAKE_DIAG_ID = uuid.uuid4()


def _make_result(
    bike_id: uuid.UUID,
    safe_to_ride: bool | None = True,
    overall_confidence: float = 0.9,
    diagnosed_parts: list[DiagnosedPart] | None = None,
    low_confidence_warning: str | None = None,
) -> DiagnosisResult:
    return DiagnosisResult(
        diagnosis_id=_FAKE_DIAG_ID,
        bike_id=bike_id,
        overall_confidence=overall_confidence,
        safe_to_ride=safe_to_ride,
        low_confidence_warning=low_confidence_warning,
        diagnosed_parts=diagnosed_parts or [],
        mechanic_prompt=None,
        raw_analysis="looks fine",
        created_at=datetime.now(timezone.utc),
    )


async def test_diagnose_success(
    db_client: AsyncClient, test_bike: Bike, rider_headers: dict
) -> None:
    result = _make_result(bike_id=test_bike.id)
    with patch(
        "app.routes.diagnose.diagnosis_service.diagnose",
        new=AsyncMock(return_value=result),
    ):
        resp = await db_client.post(
            "/api/v1/diagnose",
            data={"bike_id": str(test_bike.id)},
            files={"image": ("photo.jpg", BytesIO(b"FAKEJPEG"), "image/jpeg")},
            headers=rider_headers,
        )
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["bike_id"] == str(test_bike.id)
    assert body["safe_to_ride"] is True
    assert "overall_confidence" in body
    assert "diagnosed_parts" in body
    assert "diagnosis_id" in body


async def test_diagnose_unauthenticated(db_client: AsyncClient, test_bike: Bike) -> None:
    resp = await db_client.post(
        "/api/v1/diagnose",
        data={"bike_id": str(test_bike.id)},
        files={"image": ("photo.jpg", BytesIO(b"FAKEJPEG"), "image/jpeg")},
    )
    # HTTPBearer returns 403 when no Authorization header is present
    assert resp.status_code == 403


async def test_diagnose_invalid_image_type(
    db_client: AsyncClient, test_bike: Bike, rider_headers: dict
) -> None:
    resp = await db_client.post(
        "/api/v1/diagnose",
        data={"bike_id": str(test_bike.id)},
        files={"image": ("doc.pdf", BytesIO(b"FAKEPDF"), "application/pdf")},
        headers=rider_headers,
    )
    assert resp.status_code == 422
    assert resp.json()["detail"]["code"] == "INVALID_IMAGE_TYPE"


async def test_diagnose_bike_not_found(
    db_client: AsyncClient, rider_headers: dict
) -> None:
    missing_id = uuid.uuid4()
    with patch(
        "app.routes.diagnose.diagnosis_service.diagnose",
        new=AsyncMock(side_effect=ValueError(f"Bike {missing_id} not found")),
    ):
        resp = await db_client.post(
            "/api/v1/diagnose",
            data={"bike_id": str(missing_id)},
            files={"image": ("photo.jpg", BytesIO(b"FAKEJPEG"), "image/jpeg")},
            headers=rider_headers,
        )
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "BIKE_NOT_FOUND"


async def test_diagnose_low_confidence(
    db_client: AsyncClient, test_bike: Bike, rider_headers: dict
) -> None:
    result = _make_result(
        bike_id=test_bike.id,
        safe_to_ride=None,
        overall_confidence=0.45,
        low_confidence_warning=(
            "Image quality or angle insufficient for a confident diagnosis. "
            "Consult a mechanic for a proper inspection before riding."
        ),
    )
    with patch(
        "app.routes.diagnose.diagnosis_service.diagnose",
        new=AsyncMock(return_value=result),
    ):
        resp = await db_client.post(
            "/api/v1/diagnose",
            data={"bike_id": str(test_bike.id)},
            files={"image": ("photo.jpg", BytesIO(b"FAKEJPEG"), "image/jpeg")},
            headers=rider_headers,
        )
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["safe_to_ride"] is None
    assert body["low_confidence_warning"] is not None
