"""
Database Verification Script
T058: Verify database connection and list tables
"""
import sys
import os
from sqlmodel import create_engine, text
from dotenv import load_dotenv

# Add src to path if needed (depending on how it's run)
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src"))

try:
    from config import get_database_url
except ImportError:
    # Fallback to direct env read if pathing is tricky
    def get_database_url():
        return os.getenv("DATABASE_URL", "")

load_dotenv()

def verify_database():
    database_url = get_database_url()
    if not database_url:
        print("❌ Error: DATABASE_URL not set in environment.")
        sys.exit(1)

    print(f"Connecting to database: {database_url.split('@')[-1] if '@' in database_url else '...'}...")
    engine = create_engine(database_url)

    try:
        with engine.connect() as connection:
            print("✅ Connection successful!")

            # List tables
            result = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]

            if tables:
                print(f"Found {len(tables)} tables in 'public' schema:")
                for table in sorted(tables):
                    count_res = connection.execute(text(f"SELECT count(*) FROM {table}"))
                    count = count_res.scalar()
                    print(f" - {table} ({count} rows)")
            else:
                print("⚠ No tables found in 'public' schema.")

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_database()
