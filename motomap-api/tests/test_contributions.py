import uuid

import pytest
from httpx import AsyncClient

from app.models import Contribution, User


async def test_submit_contribution(
    db_client: AsyncClient, test_user: User, rider_headers: dict, test_bike
) -> None:
    resp = await db_client.post(
        "/api/v1/contributions",
        json={
            "content_type": "part",
            "content_id": str(test_bike.id),
            "data": {"name": "Brake Pad", "category": "Brakes"},
        },
        headers=rider_headers,
    )
    assert resp.status_code == 201
    body = resp.json()["data"]
    assert body["status"] == "PENDING"
    assert body["content_type"] == "part"
    assert body["contributor_id"] == str(test_user.id)


async def test_submit_contribution_unauthenticated(db_client: AsyncClient) -> None:
    resp = await db_client.post(
        "/api/v1/contributions",
        json={"content_type": "part", "data": {"name": "Brake Pad"}},
    )
    assert resp.status_code == 403


async def test_list_contributions_expert(
    db_client: AsyncClient,
    test_user: User,
    expert_user: User,
    rider_headers: dict,
    expert_headers: dict,
    test_bike,
) -> None:
    # Submit first
    await db_client.post(
        "/api/v1/contributions",
        json={"content_type": "part", "data": {"name": "Brake Pad"}},
        headers=rider_headers,
    )
    resp = await db_client.get("/api/v1/contributions", headers=expert_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["meta"]["total"] == 1


async def test_list_contributions_rider_forbidden(
    db_client: AsyncClient, test_user: User, rider_headers: dict
) -> None:
    resp = await db_client.get("/api/v1/contributions", headers=rider_headers)
    assert resp.status_code == 403
    assert resp.json()["detail"]["code"] == "INSUFFICIENT_ROLE"


async def test_list_contributions_unauthenticated(db_client: AsyncClient) -> None:
    resp = await db_client.get("/api/v1/contributions")
    assert resp.status_code == 403


async def test_approve_contribution(
    db_client: AsyncClient,
    test_user: User,
    expert_user: User,
    rider_headers: dict,
    expert_headers: dict,
) -> None:
    create_resp = await db_client.post(
        "/api/v1/contributions",
        json={"content_type": "part", "data": {"name": "Spark Plug"}},
        headers=rider_headers,
    )
    contrib_id = create_resp.json()["data"]["id"]

    resp = await db_client.post(
        f"/api/v1/contributions/{contrib_id}/approve",
        json={"review_notes": "Looks good"},
        headers=expert_headers,
    )
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["status"] == "APPROVED"
    assert body["reviewer_id"] == str(expert_user.id)
    assert body["review_notes"] == "Looks good"


async def test_reject_contribution(
    db_client: AsyncClient,
    test_user: User,
    expert_user: User,
    rider_headers: dict,
    expert_headers: dict,
) -> None:
    create_resp = await db_client.post(
        "/api/v1/contributions",
        json={"content_type": "part", "data": {"name": "Bad Part"}},
        headers=rider_headers,
    )
    contrib_id = create_resp.json()["data"]["id"]

    resp = await db_client.post(
        f"/api/v1/contributions/{contrib_id}/reject",
        json={"review_notes": "Duplicate entry"},
        headers=expert_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "REJECTED"


async def test_approve_rider_forbidden(
    db_client: AsyncClient,
    test_user: User,
    rider_headers: dict,
    expert_headers: dict,
) -> None:
    create_resp = await db_client.post(
        "/api/v1/contributions",
        json={"content_type": "part", "data": {"name": "X"}},
        headers=rider_headers,
    )
    contrib_id = create_resp.json()["data"]["id"]

    resp = await db_client.post(
        f"/api/v1/contributions/{contrib_id}/approve",
        headers=rider_headers,
    )
    assert resp.status_code == 403


async def test_approve_already_reviewed(
    db_client: AsyncClient,
    test_user: User,
    rider_headers: dict,
    expert_headers: dict,
) -> None:
    create_resp = await db_client.post(
        "/api/v1/contributions",
        json={"content_type": "part", "data": {"name": "Y"}},
        headers=rider_headers,
    )
    contrib_id = create_resp.json()["data"]["id"]

    await db_client.post(
        f"/api/v1/contributions/{contrib_id}/approve", headers=expert_headers
    )
    resp = await db_client.post(
        f"/api/v1/contributions/{contrib_id}/approve", headers=expert_headers
    )
    assert resp.status_code == 409
    assert resp.json()["detail"]["code"] == "ALREADY_REVIEWED"


async def test_approve_not_found(
    db_client: AsyncClient, expert_user: User, expert_headers: dict
) -> None:
    resp = await db_client.post(
        f"/api/v1/contributions/{uuid.uuid4()}/approve", headers=expert_headers
    )
    assert resp.status_code == 404


async def test_list_contributions_filter_status(
    db_client: AsyncClient,
    test_user: User,
    expert_user: User,
    rider_headers: dict,
    expert_headers: dict,
) -> None:
    create_resp = await db_client.post(
        "/api/v1/contributions",
        json={"content_type": "part", "data": {"name": "Z"}},
        headers=rider_headers,
    )
    contrib_id = create_resp.json()["data"]["id"]
    await db_client.post(
        f"/api/v1/contributions/{contrib_id}/approve", headers=expert_headers
    )

    resp = await db_client.get(
        "/api/v1/contributions?status=APPROVED", headers=expert_headers
    )
    assert resp.status_code == 200
    assert resp.json()["meta"]["total"] == 1

    resp2 = await db_client.get(
        "/api/v1/contributions?status=PENDING", headers=expert_headers
    )
    assert resp2.json()["meta"]["total"] == 0
