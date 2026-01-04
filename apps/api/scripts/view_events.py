"""
Event Log Viewer Script
T065: Parse and display event logs with filtering
"""
import os
import json
import sys
import argparse
from datetime import datetime

def view_events(event_type=None, log_date=None):
    log_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "logs")

    if not log_date:
        log_date = datetime.now().strftime("%Y-%m-%d")

    log_file = os.path.join(log_dir, f"events-{log_date}.jsonl")

    if not os.path.exists(log_file):
        print(f"❌ Log file not found: {log_file}")
        return

    print(f"--- Event Logs for {log_date} ---")

    count = 0
    try:
        with open(log_file, "r") as f:
            for line in f:
                try:
                    event = json.loads(line)

                    if event_type and event.get("event_type") != event_type:
                        continue

                    ts = event.get("timestamp", "unknown-time")
                    etype = event.get("event_type", "unknown-type")
                    uid = event.get("user_id", "system")
                    level = event.get("log_level", "info").upper()

                    print(f"[{ts}] {level} | {etype} | User: {uid}")
                    if "payload" in event:
                        print(f"    Payload: {json.dumps(event['payload'])}")
                    count += 1
                except json.JSONDecodeError:
                    continue
    except Exception as e:
        print(f"❌ Error reading logs: {e}")

    print(f"--- Total Events: {count} ---")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="View event logs")
    parser.add_argument("--type", help="Filter by event type")
    parser.add_argument("--date", help="Date in YYYY-MM-DD format")

    args = parser.parse_args()
    view_events(event_type=args.type, log_date=args.date)
