import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Setup SQLite Database URL from environment or default to local standard_pumps.db
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./standard_pumps.db")

# create_engine using check_same_thread=False for SQLite multithread compatibility
engine = create_engine(
    DATABASE_URL,
    connect_args=(
        {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    ),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a transactional database session
    and guarantees automatic connection cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
