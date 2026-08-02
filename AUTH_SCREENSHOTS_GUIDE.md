# 📸 SmartFarm AI — Week 6 Authentication Screenshot Guide

This guide provides exact steps for taking required submission screenshots for Week 6 (Authentication, OAuth, and Route Security).

---

## Required Screenshots Overview

| Screenshot Name | Page / Endpoint | Key Visual Elements to Capture |
| :--- | :--- | :--- |
| `01_user_registration.png` | Registration Page (`/register`) | Filled form, password strength meter, success toast / dashboard redirect. |
| `02_duplicate_email_error.png` | Registration Page (`/register`) | Error banner showing `"Email already registered"`. |
| `03_login_jwt.png` | Login Page (`/login`) | Login form filled, successful login transition to Dashboard. |
| `04_google_oauth_login.png` | Login Page (`/login`) | "Continue with Google" button click & Google Account selection screen. |
| `05_protected_route_guard.png` | Browser URL (`/dashboard`) | Direct unauthenticated browser navigation attempt redirecting automatically to `/login`. |
| `06_jwt_token_localstorage.png` | DevTools > Application > Storage | `localStorage` entries showing `token`, `refresh_token`, and `user` object. |
| `07_postman_auth_tests.png` | Postman Application | Successful `POST /api/v1/auth/login` response showing 200 OK and JWT payload. |

---

## Step-by-Step Instructions

### Screenshot 1: User Registration
1. Start the app (`npm run dev` in `frontend` and `uvicorn app.main:app --reload` in `backend`).
2. Open `http://localhost:5173/register`.
3. Fill in Full Name: `Jane Doe`, Email: `janedoe@farm.org`, Username: `janedoe`, Password: `Password123!`.
4. Take a screenshot before or right after clicking **Sign Up**.

### Screenshot 2: Duplicate Email Validation
1. Stay on `/register`.
2. Enter the same email `janedoe@farm.org` with a new username `janedoe2`.
3. Click **Sign Up**.
4. Capture the red error banner: `"Email already registered"`.

### Screenshot 3: JWT Login Flow
1. Navigate to `http://localhost:5173/login`.
2. Enter Username: `janedoe`, Password: `Password123!`.
3. Capture the login screen before submit and the instant transition into the Dashboard.

### Screenshot 4: Google OAuth Sign In
1. Navigate to `/login`.
2. Click **Continue with Google**.
3. Capture the Google accounts selection screen showing `smartfarm-ai` client authorization.

### Screenshot 5: Route Guarding Demonstration
1. Open an Incognito window (or clear local storage).
2. Type `http://localhost:5173/dashboard` into the browser address bar.
3. Observe automatic client-side redirection to `http://localhost:5173/login`. Capture screen.

### Screenshot 6: LocalStorage Tokens & Headers
1. Log in as any valid user.
2. Open Chrome DevTools (`F12`), navigate to **Application > Local Storage > http://localhost:5173**.
3. Capture the table displaying `token`, `refresh_token`, and `user`.

### Screenshot 7: Postman Auth Suite Execution
1. Import `SmartFarm_AI_Week6.postman_collection.json` into Postman.
2. Execute `Login User` endpoint.
3. Capture the `200 OK` status and response body containing `access_token` and `refresh_token`.
