# SmartFarm AI - Authentication System

SmartFarm AI is protected by a complete, production-grade JSON Web Token (JWT) authentication flow, fully supporting custom user credentials, token rotation, and Google OAuth login.

## Authentication Endpoints

All endpoints support both `/api` and `/api/v1` prefixes.

### 1. Register User
* **Endpoint:** `POST /api/auth/register`
* **Rate Limit:** Max 5 requests per 15 minutes per IP.
* **Request Body (JSON):**
  ```json
  {
    "email": "farmer@example.com",
    "username": "smartfarmer",
    "password": "Password123!",
    "full_name": "John Doe",
    "name": "John Doe",
    "role": "farmer"
  }
  ```
* **Validation Constraints:**
  * `email`: Must be a valid email format. Prevents duplicate registration.
  * `password`: Minimum 8 characters. Must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.
* **Success Response (201 Created):**
  ```json
  {
    "id": 1,
    "email": "farmer@example.com",
    "username": "smartfarmer",
    "full_name": "John Doe",
    "name": "John Doe",
    "role": "farmer",
    "is_active": true,
    "created_at": "2026-07-14T09:21:24.000Z",
    "updated_at": "2026-07-14T09:21:24.000Z"
  }
  ```

### 2. Login User
* **Endpoint:** `POST /api/auth/login`
* **Rate Limit:** Max 5 requests per 15 minutes per IP.
* **Request Body (Form URL Encoded):**
  ```
  username=smartfarmer&password=Password123!
  ```
* **Success Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "refresh_token": "4a7b8c9d...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "farmer@example.com",
      "username": "smartfarmer",
      "full_name": "John Doe",
      "name": "John Doe",
      "role": "farmer",
      "is_active": true,
      "created_at": "2026-07-14T09:21:24.000Z"
    }
  }
  ```
* **Errors:**
  * `401 Unauthorized` for incorrect password or non-existent username.
  * `429 Too Many Requests` if IP rate limits or brute force checks are triggered.

### 3. Invalidate / Logout Session
* **Endpoint:** `POST /api/auth/logout`
* **Request Body (JSON):**
  ```json
  {
    "refresh_token": "4a7b8c9d..."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "detail": "Successfully logged out"
  }
  ```

### 4. Refresh Access Token (Rotation)
* **Endpoint:** `POST /api/auth/refresh`
* **Request Body (JSON):**
  ```json
  {
    "refresh_token": "4a7b8c9d..."
  }
  ```
* **Success Response (200 OK):**
  * Returns a new rotated access token and a fresh refresh token (replay protection).
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "refresh_token": "9z8y7x6w...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

### 5. Get Current User Details
* **Endpoint:** `GET /api/auth/me`
* **Headers:**
  ```
  Authorization: Bearer <access_token>
  ```
* **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "email": "farmer@example.com",
    "username": "smartfarmer",
    "full_name": "John Doe",
    "name": "John Doe",
    "role": "farmer",
    "is_active": true,
    "created_at": "2026-07-14T09:21:24.000Z",
    "updated_at": "2026-07-14T09:21:24.000Z"
  }
  ```
* **Errors:**
  * `401 Unauthorized` if the token is invalid, signature is incorrect, or token has expired.

---

### Google OAuth Login

#### direct token verify
* **Endpoint:** `POST /api/auth/google`
* **Request Body (JSON):**
  ```json
  {
    "token": "google_credential_id_token_here"
  }
  ```
* **Response (200 OK):**
  * Same structure as the standard Login endpoint containing JWT access/refresh token pair and user details.

#### Authorization Redirect (OAuth Flow)
* **Redirect Page Initiator:** `GET /api/auth/google/login` -> redirects to Google's consent screen.
* **Callback Handler:** `GET /api/auth/google/callback` -> exchanges Google `code` for auth tokens, logs in or registers user, and redirects to frontend `/dashboard`.
