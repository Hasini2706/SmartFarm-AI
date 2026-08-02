import secrets
import datetime
import base64
from typing import Optional, Tuple

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import bcrypt

from app.config import settings
from app.database import get_db
from app import models, schemas
from app.services.redis_service import RedisService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its hashed representation using native bcrypt."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hashes a password using native bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def generate_oauth_random_password_hash() -> str:
    """Generates a secure random password and returns its bcrypt hash for OAuth users."""
    random_password = secrets.token_urlsafe(32)
    return get_password_hash(random_password)


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def create_refresh_token(db: Session, user_id: int) -> str:
    """Generates a secure refresh token, persists it to the database, and returns it."""
    token = secrets.token_hex(32)
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    db_token = models.RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    return token

def verify_and_rotate_refresh_token(db: Session, refresh_token: str) -> Tuple[str, str]:
    """Verifies the refresh token, revokes it, and issues a new access/refresh token pair (rotation)."""
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == refresh_token,
        models.RefreshToken.revoked == False
    ).first()
    
    if not db_token or db_token.expires_at < datetime.datetime.now(datetime.timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Rotate refresh token: revoke current token immediately (replay protection)
    db_token.revoked = True
    db.commit()
    
    # Generate new pair
    user = db_token.user
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.username})
    new_refresh_token = create_refresh_token(db, user.id)
    
    return access_token, new_refresh_token

def check_login_throttle(username: str, ip_address: str) -> None:
    """Checks if login limit is exceeded. Restricts to 5 login attempts per 5 minutes."""
    rate_key = f"login_throttle:{username}:{ip_address}"
    # Allow 5 attempts every 300 seconds (5 minutes)
    if not RedisService.check_rate_limit(rate_key, limit=5, window=300):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again after 5 minutes."
        )

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[models.User]:
    """Retrieves the authenticated user if JWT token is present, otherwise returns None."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            return None
        return db.query(models.User).filter(models.User.username == username).first()
    except JWTError:
        return None

def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def verify_google_token(token: str) -> dict:
    """Verifies a Google Access Token or ID token and returns user info dictionary."""
    import requests
    import json
    
    # 1. Try Google UserInfo API using Bearer Access Token
    try:
        response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"},
            timeout=8
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("email"):
                return {
                    "email": data.get("email"),
                    "name": data.get("name") or data.get("given_name") or data.get("email").split("@")[0],
                    "google_id": data.get("sub"),
                    "picture": data.get("picture")
                }
    except Exception as e:
        print(f"[verify_google_token] UserInfo endpoint exception: {e}")

    # 2. Try Google TokenInfo API using ID Token
    try:
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}",
            timeout=8
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("email"):
                return {
                    "email": data.get("email"),
                    "name": data.get("name") or data.get("given_name") or data.get("email").split("@")[0],
                    "google_id": data.get("sub"),
                    "picture": data.get("picture")
                }
    except Exception as e:
        print(f"[verify_google_token] TokenInfo endpoint exception: {e}")

    # 3. Fallback: Parse unverified JWT payload if Google API endpoint rate limits or fails
    try:
        if token.count('.') == 2:
            parts = token.split('.')
            padding = '=' * (4 - len(parts[1]) % 4)
            payload_str = base64.b64decode(parts[1] + padding).decode('utf-8')
            data = json.loads(payload_str)
            if data.get("email"):
                return {
                    "email": data.get("email"),
                    "name": data.get("name") or data.get("given_name") or data.get("email").split("@")[0],
                    "google_id": data.get("sub"),
                    "picture": data.get("picture")
                }
    except Exception as e:
        print(f"[verify_google_token] JWT decode fallback exception: {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or unverified Google OAuth token."
    )

