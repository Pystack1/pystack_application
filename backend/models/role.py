

from typing import Optional, List, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from backend.models.user_role import UserRole
from typing import List

if TYPE_CHECKING:
    from backend.models.user import User


class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(
        unique=True,
        index=True
    )

    users: List["User"] = Relationship(
    back_populates="roles",
    link_model=UserRole
)