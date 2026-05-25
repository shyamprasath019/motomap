from unittest.mock import AsyncMock, patch

from httpx import AsyncClient

from app.models import Bike, Part
from app.schemas.part import PartOut


async def test_search_returns_results(
    db_client: AsyncClient, test_part: Part
) -> None:
    with patch(
        "app.routes.parts.embedding_service.semantic_search",
        new=AsyncMock(return_value=[PartOut.model_validate(test_part)]),
    ):
        resp = await db_client.get("/api/v1/parts/search?q=engine+oil")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == test_part.name


async def test_search_short_query_returns_422(db_client: AsyncClient) -> None:
    resp = await db_client.get("/api/v1/parts/search?q=a")
    assert resp.status_code == 422


async def test_search_bike_id_filter(
    db_client: AsyncClient, test_part: Part, test_bike: Bike
) -> None:
    with patch(
        "app.routes.parts.embedding_service.semantic_search",
        new=AsyncMock(return_value=[PartOut.model_validate(test_part)]),
    ) as mock_search:
        resp = await db_client.get(
            f"/api/v1/parts/search?q=engine+oil&bike_id={test_bike.id}"
        )
    assert resp.status_code == 200
    assert len(resp.json()["data"]) == 1
    call_kwargs = mock_search.call_args.kwargs
    assert call_kwargs["bike_id"] == test_bike.id


async def test_search_empty_results_returns_empty_list(db_client: AsyncClient) -> None:
    with patch(
        "app.routes.parts.embedding_service.semantic_search",
        new=AsyncMock(return_value=[]),
    ):
        resp = await db_client.get("/api/v1/parts/search?q=nonexistent+part")
    assert resp.status_code == 200
    assert resp.json()["data"] == []
