import pytest
from fastapi.testclient import TestClient
from app import models, auth


def test_register_user_success(client: TestClient):
    response = client.post("/api/v1/auth/register", json={
        "email": "testfarmer@gmail.com",
        "username": "testfarmer",
        "password": "Password123!",
        "full_name": "Test Farmer",
        "role": "farmer"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testfarmer@gmail.com"
    assert data["username"] == "testfarmer"
    assert "id" in data

def test_register_user_duplicate_email(client: TestClient):
    # Register first user
    client.post("/api/v1/auth/register", json={
        "email": "dup@gmail.com",
        "username": "user1",
        "password": "Password123!"
    })
    
    # Try duplicate email
    response = client.post("/api/v1/auth/register", json={
        "email": "dup@gmail.com",
        "username": "user2",
        "password": "Password123!"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client: TestClient):
    # Register user
    client.post("/api/v1/auth/register", json={
        "email": "login@gmail.com",
        "username": "loginuser",
        "password": "Password123!"
    })
    
    # Login
    response = client.post("/api/v1/auth/login", data={
        "username": "loginuser",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "loginuser"

def test_login_invalid_password(client: TestClient):
    response = client.post("/api/v1/auth/login", data={
        "username": "loginuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_current_user_me(client: TestClient):
    # Register & Login
    client.post("/api/v1/auth/register", json={
        "email": "me@gmail.com",
        "username": "meuser",
        "password": "Password123!"
    })
    
    login_resp = client.post("/api/v1/auth/login", data={
        "username": "meuser",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    
    # Call /me with token
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["username"] == "meuser"

def test_get_current_user_unauthorized(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_google_oauth_signup_new_user(client: TestClient, monkeypatch):
    """Tests automatic signup of a brand new user via Google OAuth without IntegrityError."""
    def mock_verify_google_token(token: str):
        return {
            "email": "newgooglefarmer@example.com",
            "name": "New Google Farmer",
            "google_id": "google_1234567890",
            "picture": "http://example.com/pic.jpg"
        }
        
    monkeypatch.setattr("app.auth.verify_google_token", mock_verify_google_token)
    
    response = client.post("/api/v1/auth/google", json={"token": "mock_google_id_token"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "newgooglefarmer@example.com"
    assert data["user"]["google_id"] == "google_1234567890"


def test_google_oauth_login_existing_user(client: TestClient, db_session, monkeypatch):
    """Tests signing in an existing email account via Google OAuth (linking google_id without duplicating)."""
    # 1. Direct DB insertion of existing user to avoid HTTP endpoint rate limits
    existing_user = models.User(
        email="existingfarmer@example.com",
        username="existingfarmer",
        full_name="Existing Farmer",
        name="Existing Farmer",
        role="farmer",
        hashed_password=auth.get_password_hash("Password123!"),
        password_hash=auth.get_password_hash("Password123!")
    )
    db_session.add(existing_user)
    db_session.commit()
    
    # 2. Authenticate with Google using same email
    def mock_verify_google_token(token: str):
        return {
            "email": "existingfarmer@example.com",
            "name": "Existing Farmer",
            "google_id": "google_9876543210",
            "picture": "http://example.com/pic.jpg"
        }
        
    monkeypatch.setattr("app.auth.verify_google_token", mock_verify_google_token)
    
    response = client.post("/api/v1/auth/google", json={"token": "mock_google_id_token"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "existingfarmer@example.com"
    assert data["user"]["username"] == "existingfarmer"
    assert data["user"]["google_id"] == "google_9876543210"


