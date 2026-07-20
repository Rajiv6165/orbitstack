from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """Persisted user entity — stored in the `user` table."""

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str
    is_active: bool = Field(default=True)
