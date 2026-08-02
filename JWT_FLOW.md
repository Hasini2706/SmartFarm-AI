# SmartFarm AI - JWT Flow

This document details the lifecycle, structure, and sequence logic of the JSON Web Token (JWT) system.

## JWT Lifetimes
* **Access Token:** 7 days expiry. Sent in headers: `Authorization: Bearer <access_token>`
* **Refresh Token:** 30 days expiry. Sent in JSON body on token refresh.

---

## Complete Authentication Sequence

The diagram below illustrates user registration, credential validation, API calls using the Bearer token, and automatic token refresh rotation.

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Frontend Client
    participant API as FastAPI Backend
    participant DB as Database / Cache

    %% Registration Flow
    Note over Farmer, DB: User Registration
    Farmer->>API: POST /api/auth/register (email, password, etc)
    API->>API: Validate parameters & strength
    API->>DB: Check for duplicate email/username
    DB-->>API: No duplicates found
    API->>API: Hash password (bcrypt + 12 salt rounds)
    API->>DB: Save User instance
    DB-->>API: Saved user record
    API-->>Farmer: 201 Created (User details returned without password)

    %% Login Flow
    Note over Farmer, DB: User Login
    Farmer->>API: POST /api/auth/login (username, password)
    API->>API: Check rate limit (max 5 requests / 15 mins)
    API->>DB: Fetch user details
    DB-->>API: User details record
    API->>API: Verify hashed password
    API->>API: Generate Access Token (7d expiry)
    API->>DB: Create & persist Refresh Token
    DB-->>API: Refresh token saved
    API-->>Farmer: 200 OK (access_token, refresh_token, user info)
    Note over Farmer: Save tokens to localStorage

    %% Protected Request Flow
    Note over Farmer, DB: Protected API Requests
    Farmer->>API: GET /api/crop/recommendations (Authorization: Bearer <access_token>)
    API->>API: Verify token signature and expiry
    API->>DB: Execute query
    DB-->>API: Query data
    API-->>Farmer: 200 OK (data payload)

    %% Token Expiry & Automatic Refresh Flow
    Note over Farmer, DB: Token Expiry & Automatic Rotation
    Farmer->>API: GET /api/crop/recommendations (Authorization: Bearer <EXPIRED_access_token>)
    API->>API: Verify signature (Expired!)
    API-->>Farmer: 401 Unauthorized
    Note over Farmer: Axios Interceptor catches 401
    Farmer->>API: POST /api/auth/refresh (refresh_token)
    API->>DB: Verify active refresh token in DB
    DB-->>API: Token is valid (not revoked / not expired)
    API->>DB: Revoke current refresh token (set revoked=True)
    API->>DB: Create and persist new Refresh Token
    API->>API: Generate new Access Token (7d expiry)
    API-->>Farmer: 200 OK (new access_token, new refresh_token)
    Note over Farmer: Update localStorage with rotated tokens
    Farmer->>API: Retry original GET request (Authorization: Bearer <new_access_token>)
    API-->>Farmer: 200 OK (data payload)

    %% Logout Flow
    Note over Farmer, DB: User Logout / Revocation
    Farmer->>API: POST /api/auth/logout (refresh_token)
    API->>DB: Mark refresh token as revoked (revoked=True)
    DB-->>API: Revoked in database
    API-->>Farmer: 200 OK (detail: Successfully logged out)
    Note over Farmer: Clear localStorage
```
