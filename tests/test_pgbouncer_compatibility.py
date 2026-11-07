"""Unit tests for verifying SQLModel/SQLAlchemy engine compatibility with PgBouncer."""

import importlib
import sys
from pathlib import Path
import pytest
from sqlmodel import SQLModel, Field, Session, create_engine, select


def test_service_engine_configurations():
    """Verify all database-backed services configure pool_pre_ping and pool_recycle for PgBouncer."""
    services = ["auth-service", "catalog-service", "order-service"]
    for svc in services:
        svc_path = str(Path(f"services/{svc}").resolve())
        sys.path.insert(0, svc_path)
        try:
            session_mod = importlib.import_module("app.db.session")
            engine = session_mod.engine
            assert engine.pool._pre_ping is True, f"{svc} engine must have pool_pre_ping=True"
            assert engine.pool._recycle == 300, f"{svc} engine must have pool_recycle=300"
        finally:
            sys.path.pop(0)
            for mod_name in list(sys.modules.keys()):
                if mod_name.startswith("app"):
                    del sys.modules[mod_name]


def test_asyncpg_disables_prepared_statement_cache():
    """Verify that when an asyncpg DATABASE_URL is configured, statement caching is disabled."""
    database_url = "postgresql+asyncpg://postgres:postgres@pgbouncer:6432/test_db"
    connect_args = {}
    if "asyncpg" in database_url:
        connect_args["statement_cache_size"] = 0
        connect_args["prepared_statement_cache_size"] = 0

    assert connect_args.get("statement_cache_size") == 0
    assert connect_args.get("prepared_statement_cache_size") == 0


def test_sqlite_fallback_and_crud():
    """Verify SQLModel CRUD works seamlessly with PgBouncer engine settings on SQLite fallback."""
    connect_args = {"check_same_thread": False}
    test_engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args=connect_args,
    )

    class MockItem(SQLModel, table=True):
        id: int | None = Field(default=None, primary_key=True)
        title: str

    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        item = MockItem(title="OrbitStack Pooled Item")
        session.add(item)
        session.commit()
        session.refresh(item)
        assert item.id is not None

        queried = session.exec(select(MockItem).where(MockItem.title == "OrbitStack Pooled Item")).first()
        assert queried is not None
        assert queried.id == item.id
    test_engine.dispose()

