# Auth Endpoint Tests
# Phase 2 Chunk 2 - Coverage (T160)
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from src.main import app
from src.middleware.auth import get_current_user_id

client = TestClient(app)

@pytest.mark.integration
class TestAuthEndpoints:
    def test_register_endpoint(self, session):
        email = f"api_{uuid4().hex[:8]}@example.com"
        payload = {
            "email": email,
            "password": "password123"
        }
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["user"]["email"] == email
        assert "auth_token" in response.cookies

    def test_login_endpoint(self, session, test_user):
        # We need a known password for the test_user
        # The test_user fixture uses a fixed hash "$2b$12$hashed_password"
        # which corresponds to "password123" (if matched with bcrypt)
        # However, it's easier to just create one with a known plain password
        from src.services.auth_service import hash_password
        from src.models.user import User
        from datetime import datetime, timezone
        
        email = f"login_{uuid4().hex[:8]}@example.com"
        user = User(
            email=email,
            password_hash=hash_password("password123"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(user)
        session.commit()
        
        payload = {
            "email": email,
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == email
        assert "auth_token" in response.cookies

    def test_get_me_endpoint(self, session, test_user):
        from src.middleware.auth import create_access_token
        token = create_access_token(str(test_user.id))
        
        client.cookies.set("auth_token", token)
        response = client.get("/api/auth/me")
        assert response.status_code == 200
        assert response.json()["user"]["email"] == test_user.email
        client.cookies.clear()

    def test_logout_endpoint(self):
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        # Cookie should be deleted/expired
        assert "auth_token" not in response.cookies or response.cookies.get("auth_token") == ""
