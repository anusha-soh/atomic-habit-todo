"""
Integration Tests for Health Endpoint
Phase 2 - 008 Production Hardening (T022, T023)
"""
import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.database import get_session

client = TestClient(app)


@pytest.mark.integration
class TestHealthEndpoint:
    """Integration tests for GET /health"""

    def test_health_endpoint_db_failure(self):
        """
        T022: Health endpoint returns 503 when database is unreachable.

        Override the get_session dependency to raise an exception,
        simulating a database connection failure.
        """

        def broken_session():
            raise Exception("Database connection failed")

        app.dependency_overrides[get_session] = broken_session
        try:
            response = client.get("/health")
            assert response.status_code == 503
            data = response.json()
            assert data["status"] == "unhealthy"
            assert data["database"] == "disconnected"
        finally:
            app.dependency_overrides.pop(get_session, None)

    def test_health_endpoint_healthy(self):
        """
        T023: Health endpoint returns 200 with full status when DB is connected.

        Uses the default test database (no overrides).
        """
        # Ensure no overrides are in place
        app.dependency_overrides.pop(get_session, None)

        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        assert data["version"] == "1.0.0"
        assert "uptime_seconds" in data
        assert isinstance(data["uptime_seconds"], int)
        assert data["uptime_seconds"] >= 0
