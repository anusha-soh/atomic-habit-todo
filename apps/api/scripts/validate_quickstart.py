"""
Validate Quickstart Examples
Phase 2 Chunk 2 - Polish (T163)
Tests task creation and retrieval using the actual services
"""
import sys
import os
from uuid import uuid4
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add root directory to path to import src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.database import get_db_session
from src.models.user import User
from src.services.task_service import TaskService
from src.services.event_emitter import EventEmitter

def validate():
    print("🚀 Starting quickstart validation...")
    
    with get_db_session() as session:
        # 1. Create a test user
        user_email = f"quickstart_{uuid4().hex[:8]}@example.com"
        user = User(
            id=uuid4(),
            email=user_email,
            password_hash="hashed",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"✅ Created test user: {user_email}")
        
        # 2. Test Task Creation
        service = TaskService(session, EventEmitter())
        task = service.create_task(
            user_id=user.id,
            title="Quickstart Task",
            description="Created during validation",
            priority="high",
            tags=["test", "quickstart"]
        )
        print(f"✅ Created task: {task.title} (ID: {task.id})")
        
        # 3. Test Task Retrieval
        tasks, total = service.get_tasks(user_id=user.id)
        assert total == 1
        assert tasks[0].title == "Quickstart Task"
        print(f"✅ Retrieved tasks: found {total} task")
        
        # 4. Test Filtering
        tasks, total = service.get_tasks(user_id=user.id, priority="high")
        assert total == 1
        print("✅ Priority filtering works")
        
        # 5. Test Tag Filtering
        tasks, total = service.get_tasks(user_id=user.id, tags=["test"])
        assert total == 1
        print("✅ Tag filtering works")
        
        # 6. Test Search
        tasks, total = service.get_tasks(user_id=user.id, search="Quickstart")
        assert total == 1
        print("✅ Search works")
        
        # Cleanup
        session.delete(task)
        session.delete(user)
        session.commit()
        print("✅ Cleanup complete")

if __name__ == "__main__":
    try:
        validate()
        print("\n✨ Quickstart validation PASSED!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n❌ Quickstart validation FAILED: {str(e)}")
        sys.exit(1)