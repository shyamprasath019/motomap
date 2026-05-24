import pytest
from httpx import AsyncClient

from app.models import Bike


async def test_list_bikes_empty(db_client: AsyncClient) -> None:
    resp = await db_client.get("/api/v1/bikes")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["meta"]["total"] == 0


async def test_list_bikes(db_client: AsyncClient, test_bike: Bike) -> None:
    resp = await db_client.get("/api/v1/bikes")
    assert resp.status_code == 200
    body = resp.json()
    assert body["meta"]["total"] == 1
    assert body["data"][0]["make"] == "Bajaj"


async def test_list_bikes_filter_make(db_client: AsyncClient, test_bike: Bike) -> None:
    resp = await db_client.get("/api/v1/bikes?make=Bajaj")
    assert resp.status_code == 200
    assert resp.json()["meta"]["total"] == 1

    resp2 = await db_client.get("/api/v1/bikes?make=Honda")
    assert resp2.json()["meta"]["total"] == 0


async def test_list_bikes_filter_model(db_client: AsyncClient, test_bike: Bike) -> None:
    resp = await db_client.get("/api/v1/bikes?model=Pulsar")
    assert resp.status_code == 200
    assert resp.json()["meta"]["total"] == 1


async def test_list_bikes_pagination(db_client: AsyncClient, test_bike: Bike) -> None:
    resp = await db_client.get("/api/v1/bikes?page=1&per_page=1")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["data"]) == 1
    assert body["meta"]["page"] == 1
    assert body["meta"]["per_page"] == 1


async def test_get_bike(db_client: AsyncClient, test_bike: Bike) -> None:
    resp = await db_client.get(f"/api/v1/bikes/{test_bike.id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["id"] == str(test_bike.id)
    assert resp.json()["data"]["model"] == "Pulsar 150"


async def test_get_bike_not_found(db_client: AsyncClient) -> None:
    import uuid
    resp = await db_client.get(f"/api/v1/bikes/{uuid.uuid4()}")
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "BIKE_NOT_FOUND"


async def test_list_parts_for_bike(db_client: AsyncClient, test_part, test_bike: Bike) -> None:
    resp = await db_client.get(f"/api/v1/bikes/{test_bike.id}/parts")
    assert resp.status_code == 200
    body = resp.json()
    assert body["meta"]["total"] == 1
    assert body["data"][0]["name"] == "Engine Oil"


async def test_list_parts_filter_category(db_client: AsyncClient, test_part, test_bike: Bike) -> None:
    resp = await db_client.get(f"/api/v1/bikes/{test_bike.id}/parts?category=Lubrication")
    assert resp.status_code == 200
    assert resp.json()["meta"]["total"] == 1

    resp2 = await db_client.get(f"/api/v1/bikes/{test_bike.id}/parts?category=Brakes")
    assert resp2.json()["meta"]["total"] == 0


async def test_get_part_for_bike(db_client: AsyncClient, test_part, test_bike: Bike) -> None:
    resp = await db_client.get(f"/api/v1/bikes/{test_bike.id}/parts/{test_part.id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "Engine Oil"


async def test_get_part_for_bike_not_found(db_client: AsyncClient, test_bike: Bike) -> None:
    import uuid
    resp = await db_client.get(f"/api/v1/bikes/{test_bike.id}/parts/{uuid.uuid4()}")
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "PART_NOT_FOUND"


async def test_list_parts_bike_not_found(db_client: AsyncClient) -> None:
    import uuid
    resp = await db_client.get(f"/api/v1/bikes/{uuid.uuid4()}/parts")
    assert resp.status_code == 404
