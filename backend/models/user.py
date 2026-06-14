

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from backend.models.user_role import UserRole
from typing import List

if TYPE_CHECKING:
    from backend.models.role import Role
    from backend.models.user_profile import UserProfile


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: Optional[str] = None
    hashed_password: str

    is_active: bool = Field(default=True)
    refresh_token: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    roles: List["Role"] = Relationship(
    back_populates="users",
    link_model=UserRole
)

    profile: "UserProfile" = Relationship(
    back_populates="user"
)