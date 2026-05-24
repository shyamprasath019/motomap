import uuid

import pytest
from httpx import AsyncClient

from app.models import DIYGuide


async def test_list_guides_empty(db_client: AsyncClient) -> None:
    resp = await db_client.get("/api/v1/guides")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["meta"]["total"] == 0


async def test_list_guides(db_client: AsyncClient, test_guide: DIYGuide) -> None:
    resp = await db_client.get("/api/v1/guides")
    assert resp.status_code == 200
    body = resp.json()
    assert body["meta"]["total"] == 1
    assert body["data"][0]["title"] == "How to change engine oil"


async def test_list_guides_filter_bike(
    db_client: AsyncClient, test_guide: DIYGuide
) -> None:
    resp = await db_client.get(f"/api/v1/guides?bike_id={test_guide.bike_id}")
    assert resp.status_code == 200
    assert resp.json()["meta"]["total"] == 1

    resp2 = await db_client.get(f"/api/v1/guides?bike_id={uuid.uuid4()}")
    assert resp2.json()["meta"]["total"] == 0


async def test_list_guides_unpublished_hidden(
    db_client: AsyncClient, db_session, test_bike, test_part
) -> None:
    from app.models.diy_guide import DIYGuide as G, Difficulty

    unpublished = G(
        bike_id=test_bike.id,
        part_id=test_part.id,
        title="Draft guide",
        difficulty=Difficulty.ADVANCED,
        is_published=False,
    )
    db_session.add(unpublished)
    await db_session.commit()

    resp = await db_client.get("/api/v1/guides")
    assert resp.json()["meta"]["total"] == 0


async def test_get_guide_with_steps(
    db_client: AsyncClient, test_guide: DIYGuide, test_guide_step
) -> None:
    resp = await db_client.get(f"/api/v1/guides/{test_guide.id}")
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["title"] == "How to change engine oil"
    assert body["difficulty"] == "BEGINNER"
    assert len(body["steps"]) == 1
    assert body["steps"][0]["step_number"] == 1
    assert body["steps"][0]["title"] == "Warm up the engine"


async def test_get_guide_no_steps(db_client: AsyncClient, test_guide: DIYGuide) -> None:
    resp = await db_client.get(f"/api/v1/guides/{test_guide.id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["steps"] == []


async def test_get_guide_not_found(db_client: AsyncClient) -> None:
    resp = await db_client.get(f"/api/v1/guides/{uuid.uuid4()}")
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "GUIDE_NOT_FOUND"


async def test_list_guides_pagination(db_client: AsyncClient, test_guide: DIYGuide) -> None:
    resp = await db_client.get("/api/v1/guides?page=2&per_page=10")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["meta"]["total"] == 1
    assert body["meta"]["page"] == 2
