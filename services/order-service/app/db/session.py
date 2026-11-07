import os

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./order.db")

# Connect args configuration:
# - SQLite: check_same_thread=False
# - asyncpg (if used): statement_cache_size=0, prepared_statement_cache_size=0
#   to disable prepared statement caching for PgBouncer transaction pooling mode.
# - psycopg2: executes via unnamed prepared statements (PQexecParams), natively
#   compatible with PgBouncer transaction pooling.
connect_args = {}
if "asyncpg" in DATABASE_URL:
    connect_args["statement_cache_size"] = 0
    connect_args["prepared_statement_cache_size"] = 0
elif DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# pool_pre_ping=True tests connections for liveness on checkout, discarding stale
# connections dropped by PgBouncer idle timeouts or backend restarts.
# pool_recycle=300 recycles connections every 5 minutes to avoid stale sockets.
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args,
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
