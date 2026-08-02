from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import datetime

from app import models, schemas, auth
from app.database import get_db
from app.services.redis_service import RedisService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    
    # Check if email already registered
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
        
    # Check if username already taken
    db_username = db.query(models.User).filter(models.User.username == user_in.username).first()
    if db_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
        
    # Create user
    hashed_password = auth.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        role=user_in.role or "farmer",
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Audit log
    audit = models.AuditLog(
        user_id=db_user.id,
        action="register",
        ip_address=ip,
        details=f"User {db_user.username} registered successfully."
    )
    db.add(audit)
    db.commit()
    
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    
    # Brute-force throttling check (max 5 attempts per 5 mins)
    auth.check_login_throttle(form_data.username, ip)
    
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        # Increment failed login counter in Redis/Memory
        RedisService.check_rate_limit(f"login_throttle:{form_data.username}:{ip}", limit=0, window=300)
        
        # Log failed attempt
        audit = models.AuditLog(
            user_id=user.id if user else None,
            action="login_failed",
            ip_address=ip,
            details=f"Failed login attempt for username: {form_data.username}"
        )
        db.add(audit)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    # Create access token and refresh token
    access_token_expires = datetime.timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(db, user.id)
    
    # Audit log
    audit = models.AuditLog(
        user_id=user.id,
        action="login",
        ip_address=ip,
        details=f"User {user.username} logged in successfully."
    )
    db.add(audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh(payload: schemas.RefreshTokenRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    access_token, new_refresh_token = auth.verify_and_rotate_refresh_token(db, payload.refresh_token)
    
    # Retrieve user for token rotation response
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == new_refresh_token).first()
    user = db_token.user
    
    # Audit log
    audit = models.AuditLog(
        user_id=user.id,
        action="refresh",
        ip_address=ip,
        details="Access token successfully refreshed and rotated."
    )
    db.add(audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user
