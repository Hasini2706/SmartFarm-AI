# SmartFarm AI - Security Guidelines & Measures

SmartFarm AI implements robust, multi-layered security controls to protect user data, secure network traffic, and prevent brute-force attacks.

## 1. Password Hashing
* **Implementation:** The system uses native `bcrypt` with **12 salt rounds** for hashing passwords during user registration.
* **Storage:** Plaintext passwords are never stored in the database.
* **Output:** User models and API responses never leak password hashes or plaintext passwords.

## 2. Rate Limiting & Throttling
* **Endpoint Protection:** The authentication endpoints (`/api/auth/login`, `/api/auth/register`) are protected by a strict rate limiter allowing a **maximum of 5 requests per 15 minutes** per IP.
* **Fallback Mechanisms:** Rate limits are tracked using `RedisService`. If Redis is offline, the system automatically falls back to a thread-safe in-memory cache to guarantee enforcement without breaking uptime.
* **Too Many Requests:** Exceeding limits returns a standard `HTTP 429 Too Many Requests` status code with a descriptive warning message.
* **Brute-Force Lockout:** Custom username-based throttling restricts failed credential validation checks (5 attempts per 5 minutes per user/IP combination).

## 3. JWT Signature Verification & Secure Middleware
* **Secrets Management:** The signing key `JWT_SECRET` is stored securely in the `.env` file and loaded dynamically into the configuration settings.
* **Expiry Policy:** Access tokens have an expiration date of **7 days**, minimizing session refresh overhead for active farmers while preventing stale credentials from lingering.
* **Replay Protection:** Refresh tokens are rotated (`verify_and_rotate_refresh_token`). Upon a refresh request, the active refresh token is immediately revoked in the database and a new access/refresh pair is issued.
* **HTTP 401 Responses:** Any invalid, malformed, or expired JWT tokens immediately return an `HTTP 401 Unauthorized` response.

## 4. Input Sanitization & Request Validation
* **Data Validation:** Validation constraints are enforced at the API schema boundary using `Pydantic`.
* **Formats & Types:** Email formats are validated using Pydantic's `EmailStr` rules. Password strength checks require:
  * Minimum 8 characters.
  * 1 lowercase letter.
  * 1 uppercase letter.
  * 1 digit.
  * 1 special character.
* **Duplicate Prevention:** Registration processes check for duplicate email addresses and usernames in database transaction records before executing password hashes or insertions.

## 5. Security Headers & CORS Hashing
* **CORS Settings:** The FastAPI backend restricts access to authorized frontend origins.
* **HTTP Hardening Headers:** Custom middleware adds robust HTTP response headers on every request:
  * `X-Content-Type-Options: nosniff` (Prevents MIME sniffing)
  * `X-Frame-Options: DENY` (Mitigates clickjacking)
  * `X-XSS-Protection: 1; mode=block` (Blocks cross-site scripting attacks)
  * `Strict-Transport-Security` (Enforces HTTPS access)
  * `Content-Security-Policy` (Specifies allowed script, style, image, and socket sources)

## 6. Sensitive Error Sanitization
* **Details Suppression:** API exceptions return clean, standardized JSON objects (`{"detail": "..."}`) rather than exposing Python compiler tracebacks, SQL query strings, or database entity names.
