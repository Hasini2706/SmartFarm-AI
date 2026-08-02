from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Engine configuration parameters
engine_kwargs = {}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Postgres specific production optimization flags
    engine_kwargs["pool_size"] = settings.POSTGRES_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.POSTGRES_MAX_OVERFLOW
    engine_kwargs["pool_recycle"] = 1800  # Recycle connections after 30 minutes
    engine_kwargs["pool_pre_ping"] = True # Verify connection liveness before queries
    engine_kwargs["connect_args"] = {
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5
    }

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
