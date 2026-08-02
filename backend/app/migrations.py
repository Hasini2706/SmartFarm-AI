import datetime
from sqlalchemy import text
from app.database import engine

def run_migrations():
    """Dynamically adds missing columns to the users table in SQLite or PostgreSQL."""
    cols_to_add = [
        ("name", "VARCHAR(255)"),
        ("password_hash", "VARCHAR(255)"),
        ("google_id", "VARCHAR(255)"),
        ("updated_at", "TIMESTAMP")
    ]
    
    with engine.begin() as conn:
        # Check if the users table exists first
        if engine.url.drivername == "sqlite" or "sqlite" in str(engine.url):
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='users'"))
            table_exists = result.fetchone() is not None
            if not table_exists:
                return  # Will be created by Base.metadata.create_all
            
            result = conn.execute(text("PRAGMA table_info(users)"))
            existing_cols = {row[1] for row in result.fetchall()}
        else:
            try:
                result = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
                ))
                existing_cols = {row[0] for row in result.fetchall()}
            except Exception:
                # If table doesn't exist or query fails
                return
            
        for col_name, col_type in cols_to_add:
            if col_name not in existing_cols:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    print(f"Migration: Added column {col_name} to users table.")
                except Exception as e:
                    print(f"Migration: Error adding column {col_name}: {e}")
