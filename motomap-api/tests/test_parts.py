import uuid

import pytest
from httpx import AsyncClient

from app.models import Part


async def test_get_connections(
    db_client: AsyncClient, test_connection, test_part: Part, test_part_b: Part
) -> None:
    resp = await db_client.get(f"/api/v1/parts/{test_part.id}/connections")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["data"]) == 1
    conn = body["data"][0]
    assert conn["connection_type"] == "filters"
    assert conn["connected_part"] is not None
    assert conn["connected_part"]["name"] == "Oil Filter"


async def test_get_connections_reverse(
    db_client: AsyncClient, test_connection, test_part: Part, test_part_b: Part
) -> None:
    """Connection is bidirectional — querying from either end returns the edge."""
    resp = await db_client.get(f"/api/v1/parts/{test_part_b.id}/connections")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["data"]) == 1
    assert body["data"][0]["connected_part"]["name"] == "Engine Oil"


async def test_get_connections_empty(db_client: AsyncClient, test_part: Part) -> None:
    resp = await db_client.get(f"/api/v1/parts/{test_part.id}/connections")
    assert resp.status_code == 200
    assert resp.json()["data"] == []


async def test_get_connections_part_not_found(db_client: AsyncClient) -> None:
    resp = await db_client.get(f"/api/v1/parts/{uuid.uuid4()}/connections")
    assert resp.status_code == 404
    assert resp.json()["detail"]["code"] == "PART_NOT_FOUND"
