import os

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "sqlite:///./auth.db",  # fallback for local/test runs
)

# echo=False keeps logs clean in production; flip to True while debugging SQL
engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    """Create all tables defined by SQLModel models (used in tests / dev)."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a DB session and closes it afterwards."""
    with Session(engine) as session:
        yield session
