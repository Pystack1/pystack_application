# backend/main.py
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

# Import Routers
from backend.routers import auth, courses, enquiries, dashboard, review, user_profile

# --- RATE LIMITING IMPORTS ---
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from backend.core.rate_limiter import limiter
from slowapi import _rate_limit_exceeded_handler

app = FastAPI(title="Pystack Backend")

# --- RATE LIMITING SETUP ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
from backend.database import create_db_and_tables

@app.on_event("startup")
def startup_event():
    create_db_and_tables()

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(courses.router, prefix="/courses", tags=["courses"])
app.include_router(enquiries.router, prefix="/enquiries", tags=["enquiries"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(review.router, prefix="/reviews", tags=["reviews"])
app.include_router(user_profile.router, prefix="/user", tags=["profile"])

# Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)