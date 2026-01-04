"""
Event Emitter Service
Phase 2 Core Infrastructure - File-based event logging
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID
from typing import Any, Dict


class EventEmitter:
    """
    Fire-and-forget event emitter with file-based JSON logging.
    Events are written to daily-rotated log files in logs/ directory.

    Event Schema:
        - event_type: str (e.g., USER_REGISTERED, USER_LOGGED_IN)
        - user_id: UUID
        - timestamp: ISO8601 datetime string
        - payload: dict (additional event data)
        - log_level: str (info, debug, error)
    """

    def __init__(self, log_dir: Path = Path("logs")):
        """
        Initialize event emitter.

        Args:
            log_dir: Directory for event log files (default: logs/)
        """
        self.log_dir = log_dir
        self.log_dir.mkdir(exist_ok=True)

    def emit(
        self,
        event_type: str,
        user_id: UUID,
        payload: Dict[str, Any],
        log_level: str = "info",
    ) -> None:
        """
        Emit an event (fire-and-forget).

        Args:
            event_type: Type of event (e.g., USER_REGISTERED)
            user_id: User ID associated with the event
            payload: Additional event data
            log_level: Log level (info, debug, error)

        Example:
            emitter.emit(
                event_type="USER_REGISTERED",
                user_id=user.id,
                payload={"email": user.email},
            )
        """
        # Create event object
        event = {
            "event_type": event_type,
            "user_id": str(user_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload,
            "log_level": log_level,
        }

        # Daily rotation: events-2026-01-03.jsonl
        log_file = self.log_dir / f"events-{datetime.now(timezone.utc).date()}.jsonl"

        # Write event as JSON line (newline-delimited JSON)
        try:
            with open(log_file, "a") as f:
                f.write(json.dumps(event) + "\n")
        except Exception as e:
            # Fire-and-forget: log the error but don't raise
            print(f"[EventEmitter] Failed to write event: {e}")


# Global event emitter instance
event_emitter = EventEmitter()
