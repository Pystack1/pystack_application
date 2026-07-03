from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class EmailVerifyRequest(BaseModel):
    """Request OTP for email verification during registration."""
    email: EmailStr

class EmailVerifyConfirmRequest(BaseModel):
    """Confirm email verification with OTP."""
    email: EmailStr
    otp: str

class OTPResponse(BaseModel):
    message: str
    success: bool

class OTPVerificationRead(BaseModel):
    id: int
    email: str
    purpose: str
    is_verified: bool
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True