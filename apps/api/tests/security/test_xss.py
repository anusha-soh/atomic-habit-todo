# XSS Prevention Tests
# Phase 2 Chunk 2 - Security (T157)
import pytest
from uuid import UUID
from src.services.task_service import TaskService
from unittest.mock import Mock

@pytest.mark.security
class TestXSS:
    def test_task_creation_with_script_tags(self, session, user_id: UUID):
        """T157: Verify task fields can store script tags without execution (data integrity)"""
        # Note: XSS prevention is primarily a frontend concern (escaping), 
        # but backend should ensure data is stored exactly as sent.
        service = TaskService(session, Mock())
        
        xss_payload = "<script>alert('xss')</script>"
        task = service.create_task(
            user_id=user_id, 
            title=xss_payload, 
            description=xss_payload,
            tags=[xss_payload]
        )
        
        assert task.title == xss_payload
        assert task.description == xss_payload
        assert xss_payload in task.tags
        
        # Verify retrieved data remains unchanged
        stored_task = service.get_task(user_id, task.id)
        assert stored_task.title == xss_payload
