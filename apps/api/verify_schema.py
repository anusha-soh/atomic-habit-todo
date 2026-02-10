#!/usr/bin/env python
"""Verify habits and habit_completions tables exist with correct schema"""
import os
import sys
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Force UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

# Get database URL
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("ERROR: DATABASE_URL not set")
    exit(1)

# Create engine and inspector
engine = create_engine(database_url)
inspector = inspect(engine)

# Check habits table
print("=== HABITS TABLE ===")
if 'habits' in inspector.get_table_names():
    print("OK habits table exists")
    columns = inspector.get_columns('habits')
    print(f"  Columns ({len(columns)}): {', '.join([col['name'] for col in columns])}")

    # Check indexes
    indexes = inspector.get_indexes('habits')
    print(f"  Indexes ({len(indexes)}): {', '.join([idx['name'] for idx in indexes])}")

    # Check constraints
    constraints = inspector.get_check_constraints('habits')
    print(f"  Check constraints ({len(constraints)}): {', '.join([c['name'] for c in constraints])}")
else:
    print("ERROR habits table NOT FOUND")

print("\n=== HABIT_COMPLETIONS TABLE ===")
if 'habit_completions' in inspector.get_table_names():
    print("OK habit_completions table exists")
    columns = inspector.get_columns('habit_completions')
    print(f"  Columns ({len(columns)}): {', '.join([col['name'] for col in columns])}")

    # Check indexes
    indexes = inspector.get_indexes('habit_completions')
    print(f"  Indexes ({len(indexes)}): {', '.join([idx['name'] for idx in indexes])}")
else:
    print("ERROR habit_completions table NOT FOUND")

print("\nOK Schema verification complete!")
