# User Isolation / Authorization Tests
# Phase 2 Chunk 2 - Security (T158)
import pytest
from uuid import UUID, uuid4
from src.services.task_service import TaskService
from unittest.mock import Mock

@pytest.mark.security
class TestUserIsolation:
    def test_cross_user_access_denied(self, session, user_id: UUID, another_user):
        """T158: Verify User A cannot access or modify User B's tasks"""
        service = TaskService(session, Mock())
        
        # User B (another_user) creates a task
        task_b = service.create_task(user_id=another_user.id, title="Secret task")
        
        # User A (user_id) tries to get User B's task
        retrieved = service.get_task(user_id=user_id, task_id=task_b.id)
        assert retrieved is None
        
        # User A tries to update User B's task
        with pytest.raises(ValueError, match="Task not found"):
            service.update_task(user_id=user_id, task_id=task_b.id, title="Hijacked")
            
        # User A tries to delete User B's task
        with pytest.raises(ValueError, match="Task not found"):
            service.delete_task(user_id=user_id, task_id=task_b.id)
            
        # Verify User B's task is unchanged
        stored_b = service.get_task(user_id=another_user.id, task_id=task_b.id)
        assert stored_b.title == "Secret task"

    def test_get_tasks_enforces_user_isolation(self, session, user_id: UUID, another_user):
        """T158: Verify get_tasks only returns current user's data"""
        service = TaskService(session, Mock())
        
        # Create tasks for both users
        service.create_task(user_id=user_id, title="User A task")
        service.create_task(user_id=another_user.id, title="User B task")
        
        # User A queries
        tasks_a, total_a = service.get_tasks(user_id=user_id)
        assert total_a == 1
        assert tasks_a[0].title == "User A task"
        
        # User B queries
        tasks_b, total_b = service.get_tasks(user_id=another_user.id)
        assert total_b == 1
        assert tasks_b[0].title == "User B task"
