import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session
from datetime import datetime
import pytz

load_dotenv()

# Import models...
from backend.models.course import Course
from backend.models.enquiry import Enquiry
from backend.models.user import User
from backend.models.role import Role
from backend.models.user_role import UserRole
from backend.models.otp_verification import OTPVerification

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:Prasad123@localhost:3306/pystack_db"
)

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "False").lower() == "true",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Timezone constants
UTC = pytz.utc
KOLKATA_TZ = pytz.timezone('Asia/Kolkata')

def get_ist_now() -> datetime:
    """Get current time in IST (Kolkata timezone)."""
    return datetime.now(KOLKATA_TZ)

def utc_to_ist(utc_dt: datetime) -> datetime:
    """Convert UTC datetime to IST."""
    if utc_dt is None:
        return None
    if utc_dt.tzinfo is None:
        utc_dt = pytz.utc.localize(utc_dt)
    return utc_dt.astimezone(KOLKATA_TZ)

def ist_to_utc(ist_dt: datetime) -> datetime:
    """Convert IST datetime to UTC for storage."""
    if ist_dt is None:
        return None
    if ist_dt.tzinfo is None:
        ist_dt = KOLKATA_TZ.localize(ist_dt)
    return ist_dt.astimezone(pytz.utc)

def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session