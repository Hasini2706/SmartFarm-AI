# ✅ SmartFarm AI — Week 6 Submission Checklist

## 1. User Registration & Password Security
- [x] User Registration endpoint (`POST /api/v1/auth/register`) operational.
- [x] Native `bcrypt` password hashing (`gensalt()`, `hashpw()`, `checkpw()`). No plain text passwords saved.
- [x] Password complexity enforcement (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character).
- [x] Duplicate email registration prevention with `400 Bad Request` response.
- [x] Duplicate username registration prevention with `400 Bad Request` response.

## 2. JWT Authentication & Refresh Token Flow
- [x] JWT Login endpoint (`POST /api/v1/auth/login`) returning `access_token` (`HS256`, 7-day validity) and `refresh_token`.
- [x] JWT Token Refresh endpoint (`POST /api/v1/auth/refresh`) supporting one-time token rotation and revocation.
- [x] Logout endpoint (`POST /api/v1/auth/logout`) revoking stored refresh tokens.
- [x] Protected routes middleware (`get_current_user`, `get_current_active_user`) enforcing authorization headers.

## 3. Google OAuth 2.0 Integration
- [x] Google Login API (`POST /api/v1/auth/google`) for ID token verification.
- [x] Google OAuth Redirect URL generator (`GET /api/v1/auth/google/login`).
- [x] Google Callback Handler (`GET /api/v1/auth/google/callback`) creating/associating user accounts and performing client redirects.
- [x] Frontend "Continue with Google" button integrated into login screen.

## 4. Frontend State & Route Guarding
- [x] `AuthContext` managing user session, LocalStorage persistence (`token`, `refresh_token`, `user`).
- [x] Axios request interceptor injecting `Authorization: Bearer <token>` automatically.
- [x] Axios response interceptor handling `401 Unauthorized` by triggering silent refresh or redirecting to login.
- [x] Client-side route guarding preventing unauthenticated access to dashboard modules.

## 5. Middleware, Rate Limiting & Hardening
- [x] API Rate Limiting (60 requests / min / IP) using Redis service with in-memory fallback.
- [x] Login Brute-force throttling (5 attempts / 5 mins).
- [x] Security headers applied (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Strict-Transport-Security`).
- [x] Audit Logging (`AuditLog` model recording login, register, refresh, and logout events with IP addresses).
