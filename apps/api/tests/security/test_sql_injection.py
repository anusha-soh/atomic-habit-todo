# SQL Injection Prevention Tests
# Phase 2 Chunk 2 - Security (T156)
import pytest
from uuid import UUID
from src.services.task_service import TaskService
from unittest.mock import Mock

@pytest.mark.security
class TestSQLInjection:
    def test_search_parameter_injection(self, session, user_id: UUID):
        """T156: Verify search query is safe from SQL injection"""
        service = TaskService(session, Mock())
        
        # Create a task
        service.create_task(user_id=user_id, title="Normal task")
        
        # Try a classic SQL injection payload in search
        injection_payload = "'; DROP TABLE tasks; --"
        
        # Should not raise exception and should return 0 results
        results, total = service.get_tasks(user_id=user_id, search=injection_payload)
        
        assert total == 0
        assert len(results) == 0
        
        # Verify tasks table still exists and task is still there
        results, total = service.get_tasks(user_id=user_id)
        assert total == 1

    def test_tags_parameter_injection(self, session, user_id: UUID):
        """T156: Verify tags filter is safe from SQL injection"""
        service = TaskService(session, Mock())
        
        # Try injection in tags
        injection_payload = ["' OR '1'='1"]
        
        # Should not raise exception and should handle it as a literal tag
        results, total = service.get_tasks(user_id=user_id, tags=injection_payload)
        
        # Should only return if a task actually has that weird tag
        assert total == 0
