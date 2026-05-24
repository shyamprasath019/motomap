import pytest
from httpx import AsyncClient

from app.models import User


async def test_register_success(db_client: AsyncClient) -> None:
    resp = await db_client.post(
        "/api/v1/users/register",
        json={"email": "new@test.com", "password": "password1", "display_name": "New User"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert "data" in body
    assert body["data"]["access_token"]
    assert body["data"]["user"]["email"] == "new@test.com"
    assert body["data"]["user"]["role"] == "RIDER"


async def test_register_duplicate_email(db_client: AsyncClient) -> None:
    payload = {"email": "dup@test.com", "password": "password1", "display_name": "D"}
    await db_client.post("/api/v1/users/register", json=payload)
    resp = await db_client.post("/api/v1/users/register", json=payload)
    assert resp.status_code == 409
    assert resp.json()["detail"]["code"] == "EMAIL_EXISTS"


async def test_register_invalid_email(db_client: AsyncClient) -> None:
    resp = await db_client.post(
        "/api/v1/users/register",
        json={"email": "notanemail", "password": "password1", "display_name": "X"},
    )
    assert resp.status_code == 422


async def test_register_short_password(db_client: AsyncClient) -> None:
    resp = await db_client.post(
        "/api/v1/users/register",
        json={"email": "short@test.com", "password": "abc", "display_name": "X"},
    )
    assert resp.status_code == 422


async def test_login_success(db_client: AsyncClient) -> None:
    await db_client.post(
        "/api/v1/users/register",
        json={"email": "login@test.com", "password": "password1", "display_name": "L"},
    )
    resp = await db_client.post(
        "/api/v1/users/login",
        json={"email": "login@test.com", "password": "password1"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["access_token"]


async def test_login_wrong_password(db_client: AsyncClient) -> None:
    await db_client.post(
        "/api/v1/users/register",
        json={"email": "wp@test.com", "password": "password1", "display_name": "W"},
    )
    resp = await db_client.post(
        "/api/v1/users/login",
        json={"email": "wp@test.com", "password": "wrongpass"},
    )
    assert resp.status_code == 401
    assert resp.json()["detail"]["code"] == "INVALID_CREDENTIALS"


async def test_login_unknown_email(db_client: AsyncClient) -> None:
    resp = await db_client.post(
        "/api/v1/users/login",
        json={"email": "ghost@test.com", "password": "password1"},
    )
    assert resp.status_code == 401


async def test_get_me(db_client: AsyncClient, test_user: User, rider_headers: dict) -> None:
    resp = await db_client.get("/api/v1/users/me", headers=rider_headers)
    assert resp.status_code == 200
    assert resp.json()["data"]["email"] == "rider@test.com"


async def test_get_me_no_token(db_client: AsyncClient) -> None:
    resp = await db_client.get("/api/v1/users/me")
    assert resp.status_code == 403


async def test_get_me_bad_token(db_client: AsyncClient) -> None:
    resp = await db_client.get(
        "/api/v1/users/me", headers={"Authorization": "Bearer badtoken"}
    )
    assert resp.status_code == 401
