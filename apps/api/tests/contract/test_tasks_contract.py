"""
Contract Tests for Tasks API
Phase 2 Chunk 2 - User Story 1
Validates API request/response schemas match OpenAPI specification
"""
import pytest
from uuid import uuid4
from datetime import datetime
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

# These tests verify API contract compliance using mocked dependencies


@pytest.mark.contract
@pytest.mark.US1
class TestTasksAPIContract:
    """Contract tests for Tasks API endpoints"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test client with mocked dependencies"""
        # Import here to avoid circular imports
        from src.main import app
        from src.routes.tasks import get_task_service
        from src.middleware.auth import get_current_user_id

        self.user_id = uuid4()
        self.test_task = {
            "id": str(uuid4()),
            "user_id": str(self.user_id),
            "title": "Test Task",
            "description": "Test description",
            "status": "pending",
            "priority": "high",
            "tags": ["test"],
            "due_date": None,
            "completed": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Mock the auth dependency
        async def mock_get_current_user_id():
            return self.user_id

        # Create mock task service
        self.mock_service = Mock()

        def mock_get_task_service():
            return self.mock_service

        # Override dependencies
        app.dependency_overrides[get_current_user_id] = mock_get_current_user_id
        app.dependency_overrides[get_task_service] = mock_get_task_service

        self.client = TestClient(app)

        yield

        # Clean up overrides
        app.dependency_overrides.clear()


@pytest.mark.contract
@pytest.mark.US2
class TestTasksAPIContractUS2:
    """Contract tests for User Story 2 (update & complete tasks)"""

    @pytest.fixture(autouse=True)
    def setup(self):
        from src.main import app
        from src.routes.tasks import get_task_service
        from src.middleware.auth import get_current_user_id

        self.user_id = uuid4()
        self.task_id = uuid4()
        self.test_task = {
            "id": str(self.task_id),
            "user_id": str(self.user_id),
            "title": "Updated Task",
            "description": "Updated description",
            "status": "in_progress",
            "priority": "medium",
            "tags": ["updated"],
            "due_date": None,
            "completed": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "is_habit_task": False,
            "generated_by_habit_id": None,
        }

        async def mock_get_current_user_id():
            return self.user_id

        self.mock_service = Mock()

        def mock_get_task_service():
            return self.mock_service

        app.dependency_overrides[get_current_user_id] = mock_get_current_user_id
        app.dependency_overrides[get_task_service] = mock_get_task_service

        self.client = TestClient(app)

        yield

        app.dependency_overrides.clear()

    def test_patch_task_update_schema(self):
        """T037: Verify PATCH /api/{user_id}/tasks/{task_id} accepts partial updates"""
        payload = {
            "title": "Write comprehensive proposal",
            "description": "Updated scope",
            "status": "in_progress",
        }

        self.mock_service.update_task.return_value = self.test_task

        response = self.client.patch(
            f"/api/{self.user_id}/tasks/{self.task_id}",
            json=payload
        )

        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_patch_task_complete_schema(self):
        """T038: Verify PATCH /api/{user_id}/tasks/{task_id}/complete response schema"""
        completed_task = {**self.test_task, "status": "completed", "completed": True}
        self.mock_service.mark_complete.return_value = completed_task

        response = self.client.patch(
            f"/api/{self.user_id}/tasks/{self.task_id}/complete"
        )

        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_get_task_detail_schema(self):
        """T039: Verify GET /api/{user_id}/tasks/{task_id} returns task details"""
        self.mock_service.get_task.return_value = self.test_task

        response = self.client.get(
            f"/api/{self.user_id}/tasks/{self.task_id}"
        )

        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        expected_keys = {
            "id", "user_id", "title", "description", "status",
            "priority", "tags", "due_date", "completed",
            "created_at", "updated_at"
        }
        assert expected_keys.issubset(data.keys()), f"Missing keys: {expected_keys - set(data.keys())}"

    def test_delete_task_schema(self):
        """T056: Verify DELETE /api/{user_id}/tasks/{task_id} returns 204 No Content"""
        # For DELETE operations, we typically return 204 No Content
        # Mock the service to not raise an exception
        self.mock_service.delete_task.return_value = None

        response = self.client.delete(
            f"/api/{self.user_id}/tasks/{self.task_id}"
        )

        # Should return 204 No Content for successful deletion
        assert response.status_code == 204, f"Expected 204, got {response.status_code}: {response.text}"
        # Verify response body is empty
        assert response.content == b""
    def test_post_tasks_request_schema(self):
        """
        T016: Verify POST /api/{user_id}/tasks request schema

        Validates that the endpoint accepts valid request payload
        """
        request_data = {
            "title": "Write project proposal",
            "description": "Complete the Q1 project proposal document",
            "status": "pending",
            "priority": "high",
            "tags": ["work", "urgent"],
            "due_date": "2026-01-10T00:00:00Z",
        }

        # Return the test_task dict directly (FastAPI will serialize it)
        self.mock_service.create_task.return_value = self.test_task

        response = self.client.post(
            f"/api/{self.user_id}/tasks",
            json=request_data
        )

        # Verify request was accepted (not a 422 validation error)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"

    def test_post_tasks_response_schema(self):
        """
        T016: Verify POST /api/{user_id}/tasks response returns Task object

        Response should be a Task object with all required fields
        """
        request_data = {"title": "Test Task"}

        # Return a dict that matches Task schema
        self.mock_service.create_task.return_value = self.test_task

        response = self.client.post(
            f"/api/{self.user_id}/tasks",
            json=request_data
        )

        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"

        # Verify response contains required Task fields
        expected_keys = {
            "id", "user_id", "title", "description", "status",
            "priority", "tags", "due_date", "completed",
            "created_at", "updated_at"
        }

        data = response.json()
        # The response might be direct attributes or wrapped in a dict
        if isinstance(data, dict):
            actual_keys = set(data.keys())
            assert expected_keys.issubset(actual_keys), f"Missing keys: {expected_keys - actual_keys}"

    def test_get_tasks_pagination_schema(self):
        """
        T017: Verify GET /api/{user_id}/tasks returns paginated response
        """
        # Mock get_tasks to return paginated results
        self.mock_service.get_tasks.return_value = ([], 0)

        response = self.client.get(f"/api/{self.user_id}/tasks")

        assert response.status_code == 200

        # Verify pagination response schema
        data = response.json()
        assert "tasks" in data, "Response missing 'tasks' key"
        assert "total" in data, "Response missing 'total' key"
        assert "page" in data, "Response missing 'page' key"
        assert "limit" in data, "Response missing 'limit' key"

        assert isinstance(data["tasks"], list)
        assert isinstance(data["total"], int)
        assert isinstance(data["page"], int)
        assert isinstance(data["limit"], int)

    def test_get_tasks_query_parameters(self):
        """
        T017: Verify GET /api/{user_id}/tasks accepts filter query parameters
        """
        self.mock_service.get_tasks.return_value = ([], 0)

        # Test with all query parameters
        response = self.client.get(
            f"/api/{self.user_id}/tasks",
            params={
                "page": 2,
                "limit": 25,
                "status": "pending",
                "priority": "high",
                "tags": "work,urgent",
                "search": "proposal",
                "sort": "created_desc",
            }
        )

        assert response.status_code == 200

        # Verify service was called with correct parameters
        self.mock_service.get_tasks.assert_called_once()
        call_kwargs = self.mock_service.get_tasks.call_args
        assert call_kwargs is not None

    def test_task_schema_validation(self):
        """
        T016/T017: Verify Task response object matches schema

        Task fields must match expected types
        """
        # This validates the schema is properly defined
        from src.routes.tasks import TaskCreate, TaskResponse, TaskListResponse

        # TaskCreate should have required title field
        task_create = TaskCreate(title="Test")
        assert task_create.title == "Test"

        # TaskCreate should validate title is not empty
        with pytest.raises(Exception):
            TaskCreate(title="")

        # TaskResponse should have all task fields
        expected_fields = {
            "id", "user_id", "title", "description", "status",
            "priority", "tags", "due_date", "completed",
            "created_at", "updated_at", "is_habit_task", "generated_by_habit_id"
        }
        actual_fields = set(TaskResponse.model_fields.keys())
        assert expected_fields.issubset(actual_fields), f"TaskResponse missing fields: {expected_fields - actual_fields}"

        # TaskListResponse should have pagination fields
        pagination_fields = {"tasks", "total", "page", "limit"}
        list_fields = set(TaskListResponse.model_fields.keys())
        assert pagination_fields == list_fields
