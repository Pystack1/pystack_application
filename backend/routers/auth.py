from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from typing import List, Optional

from fastapi import BackgroundTasks
from backend.schemas.otp import (
    OTPRequest, OTPVerifyRequest, PasswordResetRequest, 
    EmailVerifyRequest, EmailVerifyConfirmRequest, OTPResponse
)
from backend.services.email_service import send_otp_email, send_registration_success_email

from backend.services.auth_service import (
    create_user, 
    create_admin,
    authenticate_user, 
    create_tokens_for_user,
    update_user_status, 
    get_all_users, 
    get_all_admins,
    update_admin,
    delete_user,
    get_user_by_email,
    create_otp_verification,
    verify_otp,
    reset_password_with_otp,
    is_email_verified,
)

from backend.models.user import User
from backend.schemas.auth import (
    RegisterRequest, 
    LoginRequest, 
    TokenResponse, 
    UserRead, 
    UserUpdate,
    CreateAdminRequest,
    AdminUpdateRequest
)
from backend.security.jwt import get_current_user, get_current_admin_or_superadmin, get_current_superadmin
from backend.database import get_db

from backend.core.rate_limiter import limiter

router = APIRouter(tags=["Auth"])

# ==================== PUBLIC ENDPOINTS (Rate Limited) ====================

@router.post("/register", status_code=201)
@limiter.limit("5/minute")
def register(request: Request, data: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """User registration - requires email verification first."""
    # Check if email is verified
    if not is_email_verified(db, data.email):
        raise HTTPException(status_code=400, detail="Email not verified. Please verify your email with OTP first.")

    existing = db.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = create_user(db, data.email, data.password, data.full_name)

    # Send registration success email
    send_registration_success_email(background_tasks, data.email)

    return {"message": "Registration successful! Please wait for Admin approval.", "user": UserRead.from_orm(user)}

@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    """User login - rate limited to prevent brute-force attacks."""
    user, error_msg = authenticate_user(db, data.email, data.password)
    if error_msg:
        raise HTTPException(status_code=401, detail=error_msg)
    tokens = create_tokens_for_user(user, db)
    return TokenResponse(**tokens)

@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserRead.from_orm(current_user)

# ==================== EMAIL VERIFICATION (Registration) ====================

@router.post("/send-verification-otp", response_model=OTPResponse)
@limiter.limit("3/minute")
def send_verification_otp(
    request: Request,
    data: EmailVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send OTP for email verification during registration."""
    # Check if email already registered
    existing = get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create OTP for email verification
    otp_record = create_otp_verification(db, data.email, "email_verify")

    # Send email in background
    send_otp_email(background_tasks, data.email, otp_record.otp, purpose="email_verify")

    return OTPResponse(message="OTP sent to your email. Valid for 15 minutes.", success=True)


@router.post("/verify-email-otp", response_model=OTPResponse)
@limiter.limit("5/minute")
def verify_email_otp(
    request: Request,
    data: EmailVerifyConfirmRequest,
    db: Session = Depends(get_db)
):
    """Verify email OTP during registration."""
    is_valid = verify_otp(db, data.email, data.otp, "email_verify")

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    return OTPResponse(message="Email verified successfully. You can now complete registration.", success=True)


# ==================== FORGOT PASSWORD ====================

@router.post("/forgot-password", response_model=OTPResponse)
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    data: OTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request password reset OTP."""
    user = get_user_by_email(db, data.email)
    if not user:
        return OTPResponse(message="If an account exists, an OTP has been sent.", success=True)

    otp_record = create_otp_verification(db, data.email, "password_reset")
    send_otp_email(background_tasks, data.email, otp_record.otp, purpose="password_reset")

    return OTPResponse(message="OTP sent to your email. Valid for 15 minutes.", success=True)


@router.post("/verify-otp", response_model=OTPResponse)
@limiter.limit("5/minute")
def verify_otp_route(
    request: Request,
    data: OTPVerifyRequest,
    db: Session = Depends(get_db)
):
    """Verify OTP for password reset."""
    is_valid = verify_otp(db, data.email, data.otp, "password_reset")

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    return OTPResponse(message="OTP verified successfully. You can now reset your password.", success=True)


@router.post("/reset-password", response_model=OTPResponse)
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Reset password with verified OTP."""
    success = reset_password_with_otp(db, data.email, data.otp, data.new_password)

    if not success:
        raise HTTPException(status_code=400, detail="Failed to reset password. Invalid OTP or user not found.")

    return OTPResponse(message="Password reset successfully. Please login with your new password.", success=True)


# ==================== USERS (Admin/SuperAdmin) ====================

@router.get("/users", response_model=List[UserRead])
@limiter.limit("100/minute")
def get_users(request: Request, db: Session = Depends(get_db), _=Depends(get_current_admin_or_superadmin)):
    users = get_all_users(db)
    return [UserRead.from_orm(u) for u in users]

@router.put("/users/{user_id}", response_model=UserRead)
@limiter.limit("30/minute")
def update_user(request: Request, user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_or_superadmin)):
    target_user = db.get(User, user_id)
    if target_user:
        if any(role.name == "SuperAdmin" for role in target_user.roles):
            raise HTTPException(status_code=403, detail="SuperAdmin cannot be modified")
        if any(role.name == "Admin" for role in target_user.roles):
            raise HTTPException(status_code=403, detail="Admin cannot be modified here")
    updated_user = update_user_status(db, user_id, data.is_active, data.roles)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserRead.from_orm(updated_user)

# ==================== ADMINS (SuperAdmin only) ====================

@router.get("/admins", response_model=List[UserRead])
@limiter.limit("100/minute")
def get_admins(request: Request, db: Session = Depends(get_db), _=Depends(get_current_superadmin)):
    admins = get_all_admins(db)
    return [UserRead.from_orm(u) for u in admins]

@router.post("/create-admin", response_model=UserRead)
@limiter.limit("10/minute")
def create_admin_route(request: Request, data: CreateAdminRequest, db: Session = Depends(get_db), _=Depends(get_current_superadmin)):
    existing = db.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_admin(db, data.email, data.password, data.full_name)
    return UserRead.from_orm(user)

@router.put("/admins/{user_id}", response_model=UserRead)
@limiter.limit("30/minute")
def update_admin_route(request: Request, user_id: int, data: AdminUpdateRequest, db: Session = Depends(get_db), _=Depends(get_current_superadmin)):
    updated = update_admin(db, user_id, data.full_name, data.email, data.password)
    if not updated:
        raise HTTPException(status_code=404, detail="Admin not found")
    return UserRead.from_orm(updated)

@router.delete("/admins/{user_id}")
@limiter.limit("20/minute")
def delete_admin_route(request: Request, user_id: int, db: Session = Depends(get_db), _=Depends(get_current_superadmin)):
    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin deleted successfully"}