# Week 6 Authentication & Security - Screenshot Checklist

To finalize your submission, replace the mockups/placeholders in this directory with live screenshots matching the criteria below.

## Required Screenshots

### 1. User Registration (`01_registration.png`)
* **Screen:** Registration page (`/register`).
* **Visuals:** Shows the completed registration form with the interactive password strength indicators ticked off (showing all criteria met in emerald green).
* **Placeholder:** Refer to `login_page_mockup.png` or `registration_page_mockup.png` in this directory.

### 2. Successful Login (`02_successful_login.png`)
* **Screen:** Dashboard landing (`/dashboard`) immediately after entering valid credentials.
* **Visuals:** The user info (e.g., username, role) is rendered in the bottom sidebar profile card, and the main dashboard charts are fully visible.

### 3. JWT in Network Tab (`03_jwt_network.png`)
* **Screen:** Browser Developer Tools -> Network Tab.
* **Visuals:** Select the `/api/v1/auth/login` request. Highlight the **Response Payload** showing the returned `access_token` and `refresh_token` JSON objects. Select another protected call (e.g. `/api/v1/crop/recommendations` or `/me`) and highlight the request header `Authorization: Bearer <token>`.

### 4. Protected Route Redirect (`04_protected_route_redirect.png`)
* **Screen:** The login page with a redirect prompt or developer console logs.
* **Visuals:** Manually type a protected URL in the address bar (e.g. `http://localhost:5173/dashboard` or `http://localhost:5173/profile`) while logged out. Verify that the app automatically redirects back to the login view and shows `/login` in the URL.

### 5. Google OAuth Flow (`05_google_oauth.png`)
* **Screen:** Google Sign-In consent popup/screen.
* **Visuals:** Click the **Continue with Google** button on the login screen. Verify that it opens the Google authentication interface displaying the application name and developer settings.

### 6. API Rate Limiting 429 (`06_rate_limit_429.png`)
* **Screen:** Login page or API response.
* **Visuals:** Submit the login form 6 times within 15 minutes. Verify that the UI displays a rate limit error message ("Rate limit exceeded. Maximum 5 login requests per 15 minutes.") and show in the DevTools Network Tab that `/login` returns a status code `429 Too Many Requests`.
