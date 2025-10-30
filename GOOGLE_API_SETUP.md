# Google Calendar API Setup Guide

This guide will help you set up Google OAuth 2.0 and Google Calendar API for the Interview Coordinator feature. This integration enables creating real Google Meet links for interviews.

## Prerequisites

- A Google Cloud Platform account
- Access to Google Cloud Console
- Your application's backend URL (e.g., `https://thesimpleai.vercel.app`)
- Your application's frontend URL (e.g., `https://thesimpleai.netlify.app`)

---

## Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Navigate to [console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top of the page
   - Click "New Project"
   - Enter project name: `Enterprise AI Hub` (or your preferred name)
   - Click "Create"
   - Wait for the project to be created and select it

---

## Step 2: Enable Google Calendar API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" > "Library"
   - Or go directly to: [console.cloud.google.com/apis/library](https://console.cloud.google.com/apis/library)

2. **Search for Google Calendar API**
   - In the search bar, type "Google Calendar API"
   - Click on "Google Calendar API" from the results

3. **Enable the API**
   - Click the "Enable" button
   - Wait for the API to be enabled

---

## Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - Navigate to "APIs & Services" > "OAuth consent screen"
   - Or go to: [console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)

2. **Choose User Type**
   - Select "External" (unless you have a Google Workspace account and want internal-only access)
   - Click "Create"

3. **Fill in App Information**
   - **App name:** `Enterprise AI Hub` (or your app name)
   - **User support email:** Your email address
   - **App logo:** (Optional) Upload your app logo
   - **App domain:**
     - Application home page: `https://thesimpleai.netlify.app`
     - Privacy policy: `https://thesimpleai.netlify.app/privacy` (create if needed)
     - Terms of service: `https://thesimpleai.netlify.app/terms` (create if needed)
   - **Authorized domains:**
     - Add: `netlify.app`
     - Add: `vercel.app`
     - Add your custom domain if you have one
   - **Developer contact information:** Your email address
   - Click "Save and Continue"

4. **Configure Scopes**
   - Click "Add or Remove Scopes"
   - Search and select the following scopes:
     - `https://www.googleapis.com/auth/calendar` - See, edit, share, and permanently delete all the calendars you can access using Google Calendar
     - `https://www.googleapis.com/auth/calendar.events` - View and edit events on all your calendars
   - Click "Update"
   - Click "Save and Continue"

5. **Add Test Users (for development)**
   - Click "Add Users"
   - Add your email and any other test users' emails
   - Click "Save and Continue"

6. **Review Summary**
   - Review your settings
   - Click "Back to Dashboard"

---

## Step 4: Create OAuth 2.0 Credentials

1. **Go to Credentials Page**
   - Navigate to "APIs & Services" > "Credentials"
   - Or go to: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

2. **Create OAuth Client ID**
   - Click "Create Credentials" > "OAuth client ID"
   
3. **Configure OAuth Client**
   - **Application type:** Select "Web application"
   - **Name:** `Enterprise AI Hub - Backend`
   
4. **Add Authorized Redirect URIs**
   Add the following URIs (replace with your actual URLs):
   ```
   https://thesimpleai.vercel.app/api/auth/google/callback
   http://localhost:5000/api/auth/google/callback
   ```
   
   If you're using a different backend URL structure, adjust accordingly.

5. **Create the Credentials**
   - Click "Create"
   - A dialog will appear with your credentials

6. **Save Your Credentials**
   - **Copy the Client ID** - You'll need this for `GOOGLE_CLIENT_ID`
   - **Copy the Client Secret** - You'll need this for `GOOGLE_CLIENT_SECRET`
   - Click "OK"
   - You can always access these again from the Credentials page

---

## Step 5: Configure Environment Variables

Add the following environment variables to your backend `.env` file:

```bash
# Google OAuth & Calendar API
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://thesimpleai.vercel.app/api/auth/google/callback

# For local development, use:
# GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### On Vercel (Production)

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add the following variables:
   - `GOOGLE_CLIENT_ID` = `your_client_id_here`
   - `GOOGLE_CLIENT_SECRET` = `your_client_secret_here`
   - `GOOGLE_REDIRECT_URI` = `https://thesimpleai.vercel.app/api/auth/google/callback`
4. Click "Save"
5. Redeploy your application for changes to take effect

---

## Step 6: Verify Database Migration

The database migration for Google OAuth columns should run automatically when you start your backend server. Verify the following columns exist in your `users` table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_email VARCHAR(255);
```

And in your `interviews` table:

```sql
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);
```

These should already be in your migration file at `backend/migrations/007_add_google_oauth.sql`.

---

## Step 7: Test the Integration

### A. Connect Google Account

1. Log in to your application
2. Go to your Profile > Email Settings
3. Click "Connect Google Calendar"
4. You should be redirected to Google's OAuth consent screen
5. Grant the requested permissions
6. You should be redirected back with a success message

### B. Create Interview with Google Meet

1. Go to Interview Coordinator
2. Schedule a new interview
3. Select "Google Meet" as the platform
4. Fill in the details and click "Schedule Interview"
5. Check the interview details - you should see a real Google Meet link (format: `https://meet.google.com/xxx-xxxx-xxx`)
6. Verify the calendar event was created in your Google Calendar

### C. Verify Email Delivery

1. Check that the interview invitation email was sent
2. Verify the email contains:
   - The .ics calendar attachment
   - The CV attachment (if uploaded)
   - The Google Meet link
3. Verify CC and BCC recipients received the email

---

## Troubleshooting

### "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not properly configured.

**Solution:**
- Ensure you've added your email as a test user (for development)
- Verify the redirect URI exactly matches what you configured
- Check that all required scopes are added

### "Token expired" or "Invalid grant" errors

**Problem:** OAuth token has expired and refresh failed.

**Solution:**
- Disconnect and reconnect your Google account
- Check that `GOOGLE_CLIENT_SECRET` is correct
- Verify token refresh logic in `backend/services/googleCalendarService.js`

### "Meeting link is a placeholder"

**Problem:** User hasn't connected Google Calendar, or connection failed.

**Solution:**
- Check backend logs for Google Calendar service errors
- Verify Google OAuth tokens are stored in the database
- Ensure the user has connected their Google account
- Check that Google Calendar API is enabled in Google Cloud Console

### "Calendar API not enabled"

**Problem:** Google Calendar API is not enabled for your project.

**Solution:**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Navigate to "APIs & Services" > "Library"
- Search for "Google Calendar API"
- Click "Enable"

### Redirect URI Mismatch

**Problem:** The redirect URI in your OAuth flow doesn't match the configured URIs.

**Solution:**
- Check the exact redirect URI in your backend code
- Ensure it matches one of the URIs in Google Cloud Console
- Include the protocol (http:// or https://)
- Don't include trailing slashes unless your code uses them

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Always use environment variables
   - Add `.env` to your `.gitignore`

2. **Use HTTPS in production**
   - All redirect URIs should use HTTPS (except localhost)

3. **Restrict API key usage**
   - Set up application restrictions
   - Set up API restrictions in Google Cloud Console

4. **Regularly rotate secrets**
   - Periodically regenerate your client secret
   - Update environment variables after rotation

5. **Monitor API usage**
   - Set up budget alerts in Google Cloud Console
   - Monitor API quotas and usage

6. **Implement token refresh**
   - Refresh tokens before they expire
   - Handle refresh token failures gracefully

---

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)

---

## Support

If you encounter issues:

1. Check the backend server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Google Calendar API is enabled
4. Check Google Cloud Console for API quota limits
5. Review the OAuth consent screen configuration

For additional help, refer to the main project documentation or contact the development team.
