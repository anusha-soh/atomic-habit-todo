import os
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch
from src.services.event_emitter import EventEmitter

def test_daily_log_rotation(tmp_path):
    # Initialize with temp directory
    emitter = EventEmitter(log_dir=tmp_path)
    user_id = "550e8400-e29b-41d4-a716-446655440000"

    # 1. Emit event for "today"
    today = datetime.now(timezone.utc).date()
    today_file = tmp_path / f"events-{today}.jsonl"

    emitter.emit("TEST_EVENT_TODAY", user_id, {"msg": "today"})
    assert today_file.exists()

    # 2. Mock datetime to simulate "tomorrow"
    tomorrow = today + timedelta(days=1)
    tomorrow_file = tmp_path / f"events-{tomorrow}.jsonl"

    # We patch the datetime inside the emit method logic if needed,
    # but the emitter uses datetime.now(timezone.utc).date() directly.
    # We'll use a wrapper or mock the specific call.

    with patch("src.services.event_emitter.datetime") as mock_date:
        # Mock now().date() for filename
        mock_date.now.return_value.date.return_value = tomorrow
        # Mock now().isoformat() for the timestamp in payload
        mock_date.now.return_value.isoformat.return_value = "2026-01-05T10:00:00Z"

        emitter.emit("TEST_EVENT_TOMORROW", user_id, {"msg": "tomorrow"})

    assert tomorrow_file.exists()

    # Verify contents
    with open(tomorrow_file, "r") as f:
        data = json.loads(f.read())
        assert data["event_type"] == "TEST_EVENT_TOMORROW"

def test_fire_and_forget_error_handling(tmp_path):
    # Initialize with a directory that will trigger an error (e.g., a file where a dir should be)
    error_file = tmp_path / "blocker"
    error_file.touch()

    # The __init__ currently calls mkdir which raises on Windows if path exists as file
    # We'll test that .emit() suppresses errors when the log directory is unusable
    emitter = EventEmitter(log_dir=tmp_path)
    # Manually overwrite log_dir to the file path to bypass __init__'s mkdir
    emitter.log_dir = error_file

    # This should not raise an exception due to try/except in emit
    emitter.emit("ERROR_TEST", "uid", {"data": "none"})
    # If we reached here without exception, fire-and-forget logic works.


def test_event_emitter_uses_logging_on_failure(tmp_path):
    """
    T052: When emit() fails to write, it should log a WARNING via _logger.

    Force a write error by setting log_dir to a file path (not a directory),
    then verify that _logger.log is called with logging.WARNING level.
    """
    import logging
    from unittest.mock import patch

    emitter = EventEmitter(log_dir=tmp_path)

    # Point log_dir to a file (not a directory) to force write error
    blocker_file = tmp_path / "blocker_file"
    blocker_file.touch()
    emitter.log_dir = blocker_file

    with patch("src.services.event_emitter._logger") as mock_logger:
        emitter.emit("TEST", "uid", {"data": "test"})
        mock_logger.log.assert_called()
        # First failure should log at WARNING level
        call_args = mock_logger.log.call_args
        assert call_args[0][0] == logging.WARNING, (
            f"Expected WARNING level ({logging.WARNING}), "
            f"got {call_args[0][0]}"
        )


def test_event_emitter_escalates_after_threshold(tmp_path):
    """
    T053: After 3 consecutive failures, emit() should escalate to ERROR level.

    Force repeated write errors and verify that on the 3rd call,
    _logger.log is called with logging.ERROR level.
    """
    import logging
    from unittest.mock import patch

    emitter = EventEmitter(log_dir=tmp_path)

    # Point log_dir to a file (not a directory) to force write error
    blocker_file = tmp_path / "blocker_file2"
    blocker_file.touch()
    emitter.log_dir = blocker_file

    # Reset failure count to 0 so we can track escalation
    emitter._failure_count = 0

    with patch("src.services.event_emitter._logger") as mock_logger:
        # First two calls should be WARNING (failure_count < 3)
        emitter.emit("TEST1", "uid", {"data": "test"})
        emitter.emit("TEST2", "uid", {"data": "test"})

        # Third call should escalate to ERROR (failure_count >= 3)
        emitter.emit("TEST3", "uid", {"data": "test"})

        # Check the 3rd call was at ERROR level
        calls = mock_logger.log.call_args_list
        assert len(calls) == 3, f"Expected 3 log calls, got {len(calls)}"

        # First two at WARNING
        assert calls[0][0][0] == logging.WARNING
        assert calls[1][0][0] == logging.WARNING

        # Third at ERROR (failure_count == 3 which is >= 3)
        assert calls[2][0][0] == logging.ERROR, (
            f"Expected ERROR level ({logging.ERROR}) on 3rd failure, "
            f"got {calls[2][0][0]}"
        )
