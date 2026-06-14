from sqlmodel import SQLModel, create_engine, Session

from backend.models.course import Course
from backend.models.enquiry import Enquiry
from backend.models.user import User
from backend.models.role import Role
from backend.models.user_role import UserRole
# Import other models here...

DATABASE_URL = "mysql+pymysql://root:Prasad123@localhost:3306/pystack_db"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session