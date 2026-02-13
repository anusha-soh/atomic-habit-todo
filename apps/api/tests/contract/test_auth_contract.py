"""
Contract Tests for Authentication API
Validates request/response schemas match
specs/001-phase2-chunk1/contracts/auth-api.openapi.yaml
"""
import pytest
import uuid
from fastapi.testclient import TestClient
from src.main import app


@pytest.fixture
def auth_client():
    return TestClient(app, raise_server_exceptions=False)


# ── POST /api/auth/register ───────────────────────────────────────────────────

@pytest.mark.contract
@pytest.mark.auth
def test_register_201_response_shape(auth_client: TestClient):
    """Contract: POST /api/auth/register returns 201 with {user: {id, email, created_at}}"""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    response = auth_client.post(
        "/api/auth/register",
        json={"email": email, "password": "password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    user = data["user"]
    assert "id" in user
    assert "email" in user
    assert "created_at" in user
    assert user["email"] == email


@pytest.mark.contract
@pytest.mark.auth
def test_register_409_duplicate_email(auth_client: TestClient):
    """Contract: POST /api/auth/register with duplicate email returns 409"""
    email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    auth_client.post("/api/auth/register", json={"email": email, "password": "password123"})
    response = auth_client.post("/api/auth/register", json={"email": email, "password": "password123"})
    assert response.status_code == 409


@pytest.mark.contract
@pytest.mark.auth
def test_register_400_short_password(auth_client: TestClient):
    """Contract: POST /api/auth/register with password < 8 chars returns 400"""
    response = auth_client.post(
        "/api/auth/register",
        json={"email": "valid@example.com", "password": "short"}
    )
    assert response.status_code == 400


@pytest.mark.contract
@pytest.mark.auth
def test_register_422_missing_email(auth_client: TestClient):
    """Contract: POST /api/auth/register missing email returns 422"""
    response = auth_client.post("/api/auth/register", json={"password": "password123"})
    assert response.status_code == 422


@pytest.mark.contract
@pytest.mark.auth
def test_register_sets_auth_cookie(auth_client: TestClient):
    """Contract: Successful registration sets auth_token httpOnly cookie"""
    email = f"cookie_{uuid.uuid4().hex[:8]}@example.com"
    response = auth_client.post(
        "/api/auth/register",
        json={"email": email, "password": "password123"}
    )
    assert response.status_code == 201
    assert "auth_token" in response.cookies


# ── POST /api/auth/login ──────────────────────────────────────────────────────

@pytest.mark.contract
@pytest.mark.auth
def test_login_200_response_shape(auth_client: TestClient):
    """Contract: POST /api/auth/login returns 200 with {user, session}"""
    email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    auth_client.post("/api/auth/register", json={"email": email, "password": "password123"})
    response = auth_client.post("/api/auth/login", json={"email": email, "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "session" in data
    assert "id" in data["user"]
    assert "email" in data["user"]
    assert "created_at" in data["user"]
    assert "id" in data["session"]
    assert "expires_at" in data["session"]


@pytest.mark.contract
@pytest.mark.auth
def test_login_401_wrong_password(auth_client: TestClient):
    """Contract: POST /api/auth/login with wrong password returns 401"""
    response = auth_client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


@pytest.mark.contract
@pytest.mark.auth
def test_login_sets_auth_cookie(auth_client: TestClient):
    """Contract: Successful login sets auth_token cookie"""
    email = f"logincookie_{uuid.uuid4().hex[:8]}@example.com"
    auth_client.post("/api/auth/register", json={"email": email, "password": "password123"})
    response = auth_client.post("/api/auth/login", json={"email": email, "password": "password123"})
    assert response.status_code == 200
    assert "auth_token" in response.cookies


# ── POST /api/auth/logout ─────────────────────────────────────────────────────

@pytest.mark.contract
@pytest.mark.auth
def test_logout_200_response_shape(auth_client: TestClient):
    """Contract: POST /api/auth/logout returns 200 with {message: str}"""
    response = auth_client.post("/api/auth/logout")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert isinstance(data["message"], str)


# ── GET /api/auth/me ──────────────────────────────────────────────────────────

@pytest.mark.contract
@pytest.mark.auth
def test_get_me_401_unauthenticated(auth_client: TestClient):
    """Contract: GET /api/auth/me without token returns 401"""
    response = auth_client.get("/api/auth/me")
    assert response.status_code == 401


@pytest.mark.contract
@pytest.mark.auth
def test_get_me_200_response_shape(auth_client: TestClient):
    """Contract: GET /api/auth/me with valid cookie returns 200"""
    email = f"me_{uuid.uuid4().hex[:8]}@example.com"
    auth_client.post("/api/auth/register", json={"email": email, "password": "password123"})
    response = auth_client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == email
    assert "id" in data["user"]
    assert "created_at" in data["user"]
