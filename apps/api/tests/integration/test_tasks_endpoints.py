# Task Endpoint Tests
# Phase 2 Chunk 2 - Coverage (T160)
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from src.main import app
from src.middleware.auth import get_current_user_id

client = TestClient(app)

@pytest.fixture
def mock_auth(user_id):
    app.dependency_overrides[get_current_user_id] = lambda: user_id
    yield
    app.dependency_overrides.clear()

@pytest.mark.integration
class TestTaskEndpoints:
    def test_list_tasks_endpoint(self, mock_auth, user_id):
        response = client.get(f"/api/{user_id}/tasks")
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert "total" in data

    def test_create_task_endpoint(self, mock_auth, user_id):
        payload = {
            "title": "API Task",
            "description": "Created via API",
            "priority": "high",
            "tags": ["api", "test"]
        }
        response = client.post(f"/api/{user_id}/tasks", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "API Task"

    def test_get_task_endpoint(self, mock_auth, user_id, sample_task):
        response = client.get(f"/api/{user_id}/tasks/{sample_task.id}")
        assert response.status_code == 200
        assert response.json()["title"] == sample_task.title

    def test_update_task_endpoint(self, mock_auth, user_id, sample_task):
        response = client.patch(
            f"/api/{user_id}/tasks/{sample_task.id}", 
            json={"title": "Updated Title"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"

    def test_delete_task_endpoint(self, mock_auth, user_id, sample_task):
        response = client.delete(f"/api/{user_id}/tasks/{sample_task.id}")
        assert response.status_code == 204
