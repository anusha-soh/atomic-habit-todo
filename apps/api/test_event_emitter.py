"""
Test script for EventEmitter functionality
Phase 2 Core Infrastructure - User Story 1

Run this script to verify event emitter works correctly:
    python test_event_emitter.py
"""
from uuid import uuid4
from src.services.event_emitter import event_emitter
from pathlib import Path
import json


def test_event_emitter():
    """Test event emitter by emitting a test event and verifying log file creation"""

    print("Testing Event Emitter...")
    print("-" * 50)

    # Create test user ID
    test_user_id = uuid4()

    # Emit test event
    print(f"Emitting TEST_EVENT for user {test_user_id}...")
    event_emitter.emit(
        event_type="TEST_EVENT",
        user_id=test_user_id,
        payload={"message": "Event emitter test successful"},
        log_level="info"
    )

    # Check if log file was created
    from datetime import datetime, timezone
    log_file = Path("logs") / f"events-{datetime.now(timezone.utc).date()}.jsonl"

    if log_file.exists():
        print(f"SUCCESS: Log file created: {log_file}")

        # Read and display the last line (latest event)
        with open(log_file, "r") as f:
            lines = f.readlines()
            if lines:
                last_event = json.loads(lines[-1])
                print(f"Latest event:")
                print(f"   Event Type: {last_event['event_type']}")
                print(f"   User ID: {last_event['user_id']}")
                print(f"   Timestamp: {last_event['timestamp']}")
                print(f"   Payload: {last_event['payload']}")
                print(f"   Log Level: {last_event['log_level']}")

        print("\nSUCCESS: Event emitter test PASSED!")
        print(f"Event logs location: {log_file.absolute()}")
        return True
    else:
        print(f"FAILED: Log file NOT created: {log_file}")
        print("FAILED: Event emitter test FAILED!")
        return False


if __name__ == "__main__":
    success = test_event_emitter()
    exit(0 if success else 1)
