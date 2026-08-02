# Google OAuth Integration Setup Guide

SmartFarm AI comes equipped with a Google OAuth integration. If live credentials are not set up, the application defaults to placeholder values and triggers a simulated developer login fallback.

Follow these steps to obtain and configure live Google OAuth credentials.

---

## Step 1: Create OAuth Client Credentials in Google Cloud Console

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown and create a new project named **SmartFarm AI**.
3. In the left sidebar, search for **APIs & Services** and select **OAuth consent screen**.
4. Choose **External** user type and click **Create**.
5. Fill out the app information:
   * **App name:** SmartFarm AI
   * **User support email:** (Your email address)
   * **Developer contact information:** (Your email address)
6. Click **Save and Continue** through the scopes and test users sections.
7. Select **Credentials** in the left navigation sidebar.
8. Click **Create Credentials** at the top, and select **OAuth client ID**.
9. In the **Application type** dropdown, select **Web application**.
10. Configure the URLs:
    * **Name:** SmartFarm Web Client
    * **Authorized JavaScript Origins:**
      * `http://localhost:5173`
      * `http://127.0.0.1:5173`
    * **Authorized redirect URIs:**
      * `http://localhost:5173/api/auth/google/callback`
      * `http://localhost:5173/api/v1/auth/google/callback`
      * `http://localhost:8000/api/v1/auth/google/callback`
11. Click **Create** to generate your credentials.
12. Copy the **Client ID** and **Client Secret**.

---

## Step 2: Configure Environment Variables

Open the `.env` file in the `backend/` directory and replace the placeholder credentials with your newly created values:

```env
JWT_SECRET=super_secret_farm_key_for_jwt_auth_1234567890

# Live Google OAuth Credentials
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback
```

---

## Step 3: OAuth Authentication Flows

### Flow A: Direct Token POST Authentication
1. The frontend invokes Google's library login overlay.
2. The user signs in, and Google returns a `credential` token.
3. The frontend passes this token to `POST /api/auth/google`.
4. The backend verifies the token and responds with access + refresh JWTs.

### Flow B: Redirect Callback Authorization Flow
1. Click the **Continue with Google** button on the login page.
2. The frontend triggers the authorization redirect path (`GET /api/auth/google/login`).
3. The backend returns a redirect to Google's consent screen.
4. Google returns a `code` query parameter to `GET /api/auth/google/callback`.
5. The backend exchanges the code for user profiles, writes credentials to frontend `localStorage`, and logs the user in.
