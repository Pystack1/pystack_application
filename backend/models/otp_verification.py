from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class OTPVerification(SQLModel, table=True):
    __tablename__ = "otp_verifications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False)
    otp: str = Field(nullable=False)
    purpose: str = Field(default="password_reset", nullable=False)
    expires_at: datetime = Field(nullable=False)
    is_verified: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)