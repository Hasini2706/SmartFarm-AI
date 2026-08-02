import pytest
from fastapi.testclient import TestClient

def test_register_user_success(client: TestClient):
    response = client.post("/api/v1/auth/register", json={
        "email": "testfarmer@gmail.com",
        "username": "testfarmer",
        "password": "strongpassword123",
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
        "password": "password123"
    })
    
    # Try duplicate email
    response = client.post("/api/v1/auth/register", json={
        "email": "dup@gmail.com",
        "username": "user2",
        "password": "password123"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client: TestClient):
    # Register user
    client.post("/api/v1/auth/register", json={
        "email": "login@gmail.com",
        "username": "loginuser",
        "password": "password123"
    })
    
    # Login
    response = client.post("/api/v1/auth/login", data={
        "username": "loginuser",
        "password": "password123"
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
        "password": "password123"
    })
    
    login_resp = client.post("/api/v1/auth/login", data={
        "username": "meuser",
        "password": "password123"
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
