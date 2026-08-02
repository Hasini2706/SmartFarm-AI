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
    
    # 1. Rate Limiting Check: Max 5 registration requests per 15 minutes
    rate_key = f"auth_rate_limit:register:{ip}"
    if not RedisService.check_rate_limit(rate_key, limit=5, window=900):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 5 registration requests per 15 minutes."
        )
        
    # 2. Check for duplicate email registration
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # Check if username already taken
    db_username = db.query(models.User).filter(models.User.username == user_in.username).first()
    if db_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
        
    # Create user
    hashed_password = auth.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name or user_in.name,
        name=user_in.name or user_in.full_name or user_in.username,
        role=user_in.role or "farmer",
        hashed_password=hashed_password,
        password_hash=hashed_password
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
    
    # 1. Rate Limiting Check: Max 5 login requests per 15 minutes
    rate_key_ip = f"auth_rate_limit:login:{ip}"
    if not RedisService.check_rate_limit(rate_key_ip, limit=5, window=900):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 5 login requests per 15 minutes."
        )
        
    # Brute-force throttling check (max 5 attempts per 5 mins per username/ip)
    auth.check_login_throttle(form_data.username, ip)
    
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password or user.password_hash or ""):
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

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(payload: schemas.RefreshTokenRequest, request: Request, db: Session = Depends(get_db)):
    # Revoke/Invalidate the specific refresh token
    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == payload.refresh_token
    ).first()
    if db_token:
        db_token.revoked = True
        db.commit()
        
    return {"detail": "Successfully logged out"}

@router.post("/google", response_model=schemas.Token)
def google_login(payload: schemas.GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    
    # Verify google token
    google_info = auth.verify_google_token(payload.token)
    email = google_info.get("email")
    google_id = google_info.get("google_id")
    name = google_info.get("name")
    
    # Check if user with google_id exists
    user = db.query(models.User).filter(models.User.google_id == google_id).first()
    if not user:
        # Check if user with email already exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            # Associate google_id with existing user
            user.google_id = google_id
            if not user.name:
                user.name = name
            db.commit()
        else:
            # Create new user
            username = email.split("@")[0]
            # Ensure username is unique
            base_username = username
            counter = 1
            while db.query(models.User).filter(models.User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1
                
            random_hash = auth.generate_oauth_random_password_hash()
            user = models.User(
                email=email,
                username=username,
                full_name=name,
                name=name,
                google_id=google_id,
                role="farmer",
                hashed_password=random_hash,
                password_hash=random_hash
            )

            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Audit log
            audit = models.AuditLog(
                user_id=user.id,
                action="register_google",
                ip_address=ip,
                details=f"User {user.username} registered successfully via Google."
            )
            db.add(audit)
            db.commit()
            
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    # Create tokens
    access_token_expires = datetime.timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(db, user.id)
    
    # Audit log
    audit = models.AuditLog(
        user_id=user.id,
        action="login_google",
        ip_address=ip,
        details=f"User {user.username} logged in successfully via Google."
    )
    db.add(audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/google/login")
def google_redirect_login():
    import urllib.parse
    params = {
        "client_id": auth.settings.GOOGLE_CLIENT_ID,
        "redirect_uri": auth.settings.GOOGLE_CALLBACK_URL,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    query = urllib.parse.urlencode(params)
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{query}"}

@router.get("/google/callback")
def google_callback(code: str, request: Request, db: Session = Depends(get_db)):
    import requests
    from fastapi.responses import HTMLResponse, RedirectResponse
    import urllib.parse
    import json
    
    print(f"[Google OAuth Callback] Processing authorization code (len={len(code)})...")
    
    payload = {
        "code": code,
        "client_id": auth.settings.GOOGLE_CLIENT_ID,
        "client_secret": auth.settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": auth.settings.GOOGLE_CALLBACK_URL,
        "grant_type": "authorization_code"
    }
    
    try:
        res = requests.post("https://oauth2.googleapis.com/token", data=payload, timeout=10)
        print(f"[Google OAuth Callback] Token exchange response code: {res.status_code}")
        
        if res.status_code != 200:
            print(f"[Google OAuth Callback] Token exchange failed with body: {res.text}")
            raise Exception(f"Google Token Exchange Failed: {res.text}")
            
        tokens = res.json()
        access_token_google = tokens.get("access_token")
        id_token_google = tokens.get("id_token")
        
        google_info = None
        if access_token_google:
            try:
                google_info = auth.verify_google_token(access_token_google)
            except Exception as e:
                print(f"[Google OAuth Callback] Access token verification notice: {e}")
                
        if not google_info and id_token_google:
            google_info = auth.verify_google_token(id_token_google)
            
        if not google_info:
            raise Exception("Could not verify Google profile details from token.")
            
        email = google_info.get("email")
        google_id = google_info.get("google_id")
        name = google_info.get("name") or (email.split("@")[0] if email else "Farmer")
        
        print(f"[Google OAuth Callback] Successfully verified Google User: {email} (google_id: {google_id})")
        
        # User Lookup & Registration
        user = db.query(models.User).filter(models.User.google_id == google_id).first() if google_id else None
        if not user and email:
            user = db.query(models.User).filter(models.User.email == email).first()
            if user:
                user.google_id = google_id
                if not user.name:
                    user.name = name
                if not user.full_name:
                    user.full_name = name
                db.commit()
                
        if not user and email:
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while db.query(models.User).filter(models.User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1
                
            random_hash = auth.generate_oauth_random_password_hash()
            user = models.User(
                email=email,
                username=username,
                full_name=name,
                name=name,
                google_id=google_id,
                role="farmer",
                hashed_password=random_hash,
                password_hash=random_hash
            )

            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Audit log
            audit = models.AuditLog(
                user_id=user.id,
                action="register_google",
                ip_address=request.client.host if request.client else "unknown",
                details=f"User {user.username} registered via Google OAuth."
            )
            db.add(audit)
            db.commit()
            
        if not user:
            raise Exception("Failed to retrieve or create user account.")
            
        if not user.is_active:
            raise Exception("User account is disabled.")

        # Generate SmartFarm JWT Access & Refresh Tokens
        access_token_expires = datetime.timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
        refresh_token = auth.create_refresh_token(db, user.id)

        # Audit log
        audit = models.AuditLog(
            user_id=user.id,
            action="login_google",
            ip_address=request.client.host if request.client else "unknown",
            details=f"User {user.username} logged in via Google OAuth."
        )
        db.add(audit)
        db.commit()

        user_data = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "name": user.name,
            "role": user.role,
            "is_active": user.is_active
        }
        user_json = json.dumps(user_data)
        frontend_url = os.getenv("FRONTEND_URL", getattr(auth.settings, "FRONTEND_URL", "http://localhost:5173")).rstrip("/")
        frontend_redirect_url = f"{frontend_url}/?token={access_token}&refresh_token={refresh_token}&user={urllib.parse.quote(user_json)}"

        print(f"[Google OAuth Callback] OAuth Success! Redirecting to frontend: {frontend_redirect_url}")

        return RedirectResponse(url=frontend_redirect_url)

    except Exception as e:
        print(f"[Google OAuth Callback] Authentication Exception: {e}")
        error_detail = str(e).replace("'", "\\'")
        frontend_url = os.getenv("FRONTEND_URL", getattr(auth.settings, "FRONTEND_URL", "http://localhost:5173")).rstrip("/")
        login_url = f"{frontend_url}/login"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 60px 20px; background-color: #0f172a; color: #f8fafc;">
            <div style="max-width: 480px; margin: 0 auto; background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155;">
                <h3 style="color: #ef4444; margin-top: 0;">Google Authentication Encountered An Issue</h3>
                <p style="color: #94a3b8; font-size: 14px;">{error_detail}</p>
                <a href="{login_url}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #10b981; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Return to Login</a>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=status.HTTP_400_BAD_REQUEST)



@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_user_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
        current_user.name = payload.full_name
    if payload.name is not None:
        current_user.name = payload.name
        if not current_user.full_name:
            current_user.full_name = payload.name
            
    db.commit()
    db.refresh(current_user)
    return current_user

