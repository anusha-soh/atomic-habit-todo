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

@pytest.mark.contract
@pytest.mark.habits
@pytest.mark.US1_habits
def test_create_habit_contract(client: TestClient, user_id: UUID):
    """
    T020: Contract test for POST /api/{user_id}/habits
    Verifies request and response schema compliance.
    """
    habit_data = {
        "identity_statement": "I am a person who reads daily",
        "two_minute_version": "Read one page",
        "category": "Learning",
        "recurring_schedule": {"type": "daily"}
    }
    
    # This should fail or return 200/201 with empty body if stubbed
    response = client.post(f"/api/{user_id}/habits", json=habit_data)
    
    # We expect this to fail or not return the full object yet
    assert response.status_code == 201
    data = response.json()
    
    # Required fields per HabitResponse schema
    assert "id" in data
    assert data["user_id"] == str(user_id)
    assert data["identity_statement"] == habit_data["identity_statement"]
    assert data["two_minute_version"] == habit_data["two_minute_version"]
    assert data["category"] == habit_data["category"]
    assert data["status"] == "active"
    assert "current_streak" in data
    assert "created_at" in data

@pytest.mark.contract
@pytest.mark.habits
@pytest.mark.US1_habits
def test_list_habits_contract(client: TestClient, user_id: UUID):
    """
    T021: Contract test for GET /api/{user_id}/habits
    Verifies paginated response schema compliance.
    """
    response = client.get(f"/api/{user_id}/habits")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "habits" in data
    assert isinstance(data["habits"], list)
    assert "total" in data
    assert "page" in data
    assert "limit" in data
