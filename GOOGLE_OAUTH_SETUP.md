# Google OAuth Setup Instructions

## Error Fix: redirect_uri_mismatch

You're seeing this error because the redirect URI configured in your Google Cloud Console doesn't match what the application is sending.

### Current Configuration (What the app sends):
```
https://thesimpleai.vercel.app/api/auth/google/callback
```

**IMPORTANT:** You MUST add this exact URL to Google Cloud Console. Do NOT use Vercel preview URLs (the ones with random hashes like `thesimpleai-7j85zwjt9-...`).

### Steps to Fix:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project "TheSimpleAI" or create a new one

2. **Navigate to OAuth Consent Screen**
   - Go to: APIs & Services → OAuth consent screen
   - Make sure your app is configured (External or Internal)
   - Add test users if in testing mode

3. **Configure OAuth 2.0 Credentials**
   - Go to: APIs & Services → Credentials
   - Click on your existing OAuth 2.0 Client ID or create a new one
   - Under "Authorized redirect URIs", add:
     ```
     https://thesimpleai.vercel.app/api/auth/google/callback
     ```
   - If testing locally, also add:
     ```
     http://localhost:5000/api/auth/google/callback
     ```

4. **Save Your Credentials**
   - Copy your Client ID and Client Secret
   - Add them to your backend `.env` file:
     ```bash
     GOOGLE_CLIENT_ID=your_client_id_here
     GOOGLE_CLIENT_SECRET=your_client_secret_here
     ```

5. **Enable Required APIs**
   - Go to: APIs & Services → Library
   - Search for and enable:
     - Google Calendar API
     - Google People API (for user info)

### Environment Variables Required

**Backend (.env):**
```bash
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Backend URL (important for redirect URI)
BACKEND_URL=https://thesimpleai.vercel.app  # or your actual backend URL

# Frontend URL (for redirecting user after OAuth)
FRONTEND_URL=https://thesimpleai.netlify.app
```

### Important Notes:

1. **Backend URL vs Frontend URL:**
   - The OAuth callback is handled by the **BACKEND**, so the redirect URI must point to your backend
   - After processing, the backend redirects the user back to the frontend

2. **Vercel Deployment:**
   - The backend URL MUST be your production URL: `https://thesimpleai.vercel.app`
   - Set `BACKEND_URL` environment variable in Vercel to ensure it uses the production URL
   - DO NOT rely on `VERCEL_URL` as it changes with each preview deployment

3. **Testing Mode:**
   - If your Google OAuth app is in testing mode, only added test users can authenticate
   - To allow all users, publish your app (requires verification for sensitive scopes)

4. **Scopes Required:**
   The app requests these scopes:
   - `https://www.googleapis.com/auth/calendar.events` - Create/manage calendar events
   - `https://www.googleapis.com/auth/calendar.readonly` - Read calendar data
   - `https://www.googleapis.com/auth/userinfo.email` - Get user email
   - `https://www.googleapis.com/auth/userinfo.profile` - Get user profile

### Verify Configuration:

After updating, test the OAuth flow:
1. Go to Profile → Calendar tab
2. Click "Connect Google Calendar"
3. You should be redirected to Google's consent screen
4. After authorizing, you should be redirected back to your profile page

### Troubleshooting:

- **Still seeing redirect_uri_mismatch:** Double-check that the URI in Google Console exactly matches (including https/http, trailing slashes, etc.)
- **Invalid client error:** Client ID or Secret is incorrect
- **Access denied:** User needs to be added as a test user if app is in testing mode
- **Scopes not granted:** Make sure all required APIs are enabled in Google Cloud Console
