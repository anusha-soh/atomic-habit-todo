import pytest
from uuid import UUID
from fastapi.testclient import TestClient

from src.main import app
from src.middleware.auth import get_current_user_id

@pytest.fixture(autouse=True)
def mock_auth(user_id):
    """Mock authentication to return the test user_id"""
    app.dependency_overrides[get_current_user_id] = lambda: user_id
    yield
    app.dependency_overrides.pop(get_current_user_id, None)

@pytest.mark.integration
@pytest.mark.habits
@pytest.mark.US1_habits
def test_create_habit_endpoint(client: TestClient, user_id: UUID, test_user):
    """T029: POST /api/{user_id}/habits integration test"""
    # Note: We assume authentication is handled by a cookie/mocked for TestClient
    # In this project, get_current_user_id is often mocked or depends on a session
    
    habit_data = {
        "identity_statement": "I am a runner",
        "two_minute_version": "Put on shoes",
        "category": "Health & Fitness",
        "recurring_schedule": {"type": "daily"}
    }
    
    # We need to simulate being logged in as user_id
    # Assuming the middleware uses a dependency that can be overridden or uses a cookie
    response = client.post(f"/api/{user_id}/habits", json=habit_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["identity_statement"] == "I am a runner"

@pytest.mark.integration
@pytest.mark.habits
@pytest.mark.US1_habits
def test_list_habits_endpoint(client: TestClient, user_id: UUID, test_user, sample_habit):
    """T030: GET /api/{user_id}/habits integration test"""
    response = client.get(f"/api/{user_id}/habits")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(h["id"] == str(sample_habit.id) for h in data["habits"])

@pytest.mark.integration
@pytest.mark.habits
@pytest.mark.US1_habits
def test_user_isolation_endpoint(client: TestClient, user_id: UUID, another_user, sample_habit):
    """T031: User B cannot access User A's habits"""
    # sample_habit belongs to user_id
    
    # 1. User A (logged in as User A) can see their habit
    # (Auth mocked to user_id by default in fixture)
    response = client.get(f"/api/{user_id}/habits/{sample_habit.id}")
    assert response.status_code == 200

    # 2. User A (logged in as User A) tries to access User B's path
    response = client.get(f"/api/{another_user.id}/habits")
    assert response.status_code == 403
    
    # 3. User B (logged in as User B) tries to access User A's habit
    app.dependency_overrides[get_current_user_id] = lambda: another_user.id
    try:
        response = client.get(f"/api/{user_id}/habits/{sample_habit.id}")
        assert response.status_code == 403
        
        # 4. User B (logged in as User B) gets their own empty list
        response = client.get(f"/api/{another_user.id}/habits")
        assert response.status_code == 200
        data = response.json()
        assert all(h["id"] != str(sample_habit.id) for h in data["habits"])
    finally:
        # Restore default mock for other tests
        app.dependency_overrides[get_current_user_id] = lambda: user_id
