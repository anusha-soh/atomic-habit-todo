"""
Integration Tests for Rate Limiting
Phase 2 - 008 Production Hardening (T025)
"""
import pytest
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


@pytest.mark.integration
class TestRateLimiting:
    """Integration tests for rate limiting on authentication endpoints"""

    def test_login_rate_limit(self):
        """
        T025: Login endpoint rate limiting - 10/minute.

        Send 12 rapid POST requests to /api/auth/login with invalid
        credentials. The rate limiter (slowapi, 10/minute) should reject
        at least one request with HTTP 429 Too Many Requests.
        """
        payload = {
            "email": "fake@test.com",
            "password": "wrong",
        }

        status_codes = []
        for _ in range(12):
            response = client.post("/api/auth/login", json=payload)
            status_codes.append(response.status_code)

        # At least one request should have been rate-limited
        assert 429 in status_codes, (
            f"Expected at least one 429 response in 12 rapid requests, "
            f"but got status codes: {status_codes}"
        )
