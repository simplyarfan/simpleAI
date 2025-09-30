# Calendar OAuth Setup Guide

This guide explains how to set up Google Calendar and Outlook Calendar OAuth integration for the Interview Coordinator feature.

## Why OAuth is Needed

OAuth allows the Interview Coordinator to:
- Automatically create calendar events when scheduling interviews
- Send calendar invitations from your email account
- Generate meeting links (Google Meet/Teams) automatically
- Keep your calendar synced with scheduled interviews

## Option 1: Google Calendar OAuth Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Interview Coordinator" or similar
4. Click "Create"

### Step 2: Enable Google Calendar API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (or Internal if using Google Workspace)
   - App name: "Interview Coordinator"
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `https://www.googleapis.com/auth/calendar`
   - Save and continue

4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "Interview Coordinator Web"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://thesimpleai.netlify.app` (your production URL)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://thesimpleai.netlify.app` (your production URL)
   - Click "Create"

5. Copy the **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

### Step 4: Add to Environment Variables
Add to your `.env.local` file:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
```

## Option 2: Outlook Calendar OAuth Setup

### Step 1: Register an App in Azure
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: "Interview Coordinator"
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI:
   - Platform: "Single-page application (SPA)"
   - URI: `https://thesimpleai.netlify.app` (your production URL)
7. Click "Register"

### Step 2: Configure API Permissions
1. In your app, go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Calendars.ReadWrite`
   - `User.Read`
6. Click "Add permissions"
7. Click "Grant admin consent" (if you have admin rights)

### Step 3: Get Application ID
1. Go to "Overview" in your app
2. Copy the **Application (client) ID** (looks like: `12345678-1234-1234-1234-123456789abc`)

### Step 4: Add to Environment Variables
Add to your `.env.local` file:
```
NEXT_PUBLIC_OUTLOOK_CLIENT_ID=your-application-id-here
```

## Testing the Integration

1. Restart your development server after adding environment variables
2. Go to Profile Settings → Calendar Integration tab
3. Click "Connect Google" or "Connect Outlook"
4. You should see the OAuth consent screen
5. Grant permissions
6. You'll be redirected back with a success message

## Troubleshooting

### "OAuth is not configured" error
- Make sure you've added the environment variables to `.env.local`
- Restart your development server
- Check that the variable names are exactly: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_OUTLOOK_CLIENT_ID`

### "Redirect URI mismatch" error
- Make sure your authorized redirect URIs in Google Cloud Console or Azure Portal match your application URL exactly
- For local development, use `http://localhost:3000`
- For production, use your Netlify URL

### CSP (Content Security Policy) errors
- These are normal if OAuth is not configured
- Once you add the client IDs, the errors will go away

## For Production Deployment

When deploying to Netlify, add the environment variables:
1. Go to your Netlify site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = your Google client ID
   - `NEXT_PUBLIC_OUTLOOK_CLIENT_ID` = your Outlook client ID
4. Redeploy your site

## Security Notes

- Never commit your `.env.local` file to Git
- The `NEXT_PUBLIC_` prefix means these variables are exposed to the browser (this is safe for OAuth client IDs)
- OAuth client IDs are not secret - they're meant to be public
- The actual authentication happens on Google/Microsoft servers, not your app

## Need Help?

If you encounter issues:
1. Check the browser console for specific error messages
2. Verify your OAuth credentials are correct
3. Ensure redirect URIs match exactly
4. Make sure APIs are enabled in Google Cloud Console
5. Check that permissions are granted in Azure Portal
