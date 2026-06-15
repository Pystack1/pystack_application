from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
from sqlalchemy.orm import joinedload   # ← ADD THIS LINE

from backend.database import get_db
from backend.models.user import User

# Load environment variables from .env file (backend/.env)
load_dotenv()

# --- JWT Configuration from .env ---
SECRET_KEY = os.getenv("SECRET_KEY", "SECRET_KEY=8f9c4d2a7b1e5f6c9a3d8e1f7b4c2a9d6e5f1a8c3b7d9e2f4a6c8b1d5e7f9a2")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))   # 24 hours default
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str, token_type: Optional[str] = None) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if token_type and payload.get("type") != token_type:
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(auth_scheme),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    email = decode_token(token, "access")
    
    user = db.exec(
        select(User)
        .options(joinedload(User.roles))
        .where(User.email == email)
    ).unique().first()      # ← Add .unique()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials or account not approved")
    return user


def get_current_superadmin(current_user: User = Depends(get_current_user)):
    if not any(role.name == "SuperAdmin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="SuperAdmin privileges required")
    return current_user


def get_current_admin_or_superadmin(current_user: User = Depends(get_current_user)):
    roles = [role.name for role in current_user.roles]
    if "SuperAdmin" not in roles and "Admin" not in roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user