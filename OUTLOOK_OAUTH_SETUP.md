# Outlook OAuth Setup Guide

This guide explains how to properly configure Outlook OAuth 2.0 for the Interview Coordinator email feature.

## Overview

The system uses **OAuth 2.0 Authorization Code Flow** with server-side token exchange. This is the secure, industry-standard approach for web applications.

### Architecture

```
User → Frontend → Backend OAuth URL → Microsoft OAuth → Backend Callback → Token Storage → Email Sending
```

- **Frontend**: Redirects user to Microsoft login
- **Backend**: Exchanges authorization code for access + refresh tokens
- **Database**: Stores tokens securely (never exposed to frontend)
- **Email Service**: Uses stored tokens with automatic refresh

## Azure Portal Configuration

### 1. Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com/) → **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Configure:
   - **Name**: `Nexus AI Platform - Outlook Integration`
   - **Supported account types**: `Accounts in any organizational directory (Any Azure AD directory - Multitenant)`
   - **Redirect URI**: 
     - Platform: `Web`
     - URI: `https://thesimpleai.vercel.app/api/auth/outlook/callback`
     - For local dev, add: `http://localhost:5000/api/auth/outlook/callback`

### 2. Configure API Permissions

1. Go to **API permissions** in your app registration
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `Mail.Send` - Send mail as a user
   - `User.Read` - Read user profile
   - `offline_access` - Maintain access to data (for refresh tokens)
4. Click **Grant admin consent** (if you're an admin)

### 3. Generate Client Secret

1. Go to **Certificates & secrets** → **Client secrets**
2. Click **New client secret**
3. Description: `Nexus Backend OAuth Secret`
4. Expires: **24 months** (recommended)
5. Click **Add**
6. **⚠️ IMPORTANT**: Copy the secret value immediately (it won't be shown again)

### 4. Get Application Credentials

From your app registration **Overview** page, copy:
- **Application (client) ID** - This is your `OUTLOOK_CLIENT_ID`
- **Client secret value** (from step 3) - This is your `OUTLOOK_CLIENT_SECRET`

## Environment Configuration

### Backend (.env)

Add these variables to your backend `.env` file:

```bash
# Outlook OAuth Credentials
OUTLOOK_CLIENT_ID=your-application-client-id-here
OUTLOOK_CLIENT_SECRET=your-client-secret-value-here

# Backend URL (must match redirect URI in Azure)
BACKEND_URL=https://thesimpleai.vercel.app

# Frontend URL (for OAuth redirects after success/error)
FRONTEND_URL=https://thesimpleai.netlify.app
```

### Local Development

For local testing, use:

```bash
OUTLOOK_CLIENT_ID=your-application-client-id-here
OUTLOOK_CLIENT_SECRET=your-client-secret-value-here
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

**Note**: Make sure `http://localhost:5000/api/auth/outlook/callback` is added as a redirect URI in Azure Portal.

### Vercel Deployment

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `OUTLOOK_CLIENT_ID` = `your-application-client-id`
   - `OUTLOOK_CLIENT_SECRET` = `your-client-secret-value`
   - `BACKEND_URL` = `https://thesimpleai.vercel.app`
   - `FRONTEND_URL` = `https://thesimpleai.netlify.app`
3. Redeploy your backend

### Frontend Configuration

**No frontend environment variables needed!** The frontend simply redirects to the backend OAuth endpoint.

## OAuth Flow Details

### 1. User Initiates Connection

```javascript
// User clicks "Connect Outlook" button
// Frontend calls: GET /api/auth/outlook/auth
// Backend returns Microsoft OAuth URL with:
// - client_id
// - redirect_uri (backend callback)
// - scope: offline_access Mail.Send User.Read
// - state: user_id (for identifying user after redirect)
```

### 2. User Authorizes

```
Frontend redirects to: https://login.microsoftonline.com/.../authorize?...
User logs in with Microsoft account
Microsoft asks for permission consent
```

### 3. Backend Receives Callback

```javascript
// Microsoft redirects to: GET /api/auth/outlook/callback?code=xxx&state=user_id
// Backend:
// 1. Exchanges code for tokens (POST to Microsoft token endpoint)
// 2. Receives: access_token, refresh_token, expires_in
// 3. Fetches user email from Microsoft Graph
// 4. Stores tokens in database
// 5. Redirects to: frontend_url/profile?outlook=connected
```

### 4. Token Storage (Database)

```sql
UPDATE users SET
  outlook_access_token = 'encrypted_token',
  outlook_refresh_token = 'encrypted_token',  -- Critical for long-term access!
  outlook_token_expires_at = '2025-10-31T14:00:00Z',
  outlook_email = 'user@company.com'
WHERE id = 'user_id';
```

### 5. Sending Emails

```javascript
// When sending email:
// 1. Check if token is expired
// 2. If expired, refresh using refresh_token
// 3. Send email via Microsoft Graph API
// 4. Update stored access_token if refreshed
```

## Security Features

✅ **Tokens never exposed to frontend** - All OAuth happens server-side  
✅ **Refresh token support** - Long-term access without re-authentication  
✅ **Token encryption** - Stored securely in database  
✅ **Automatic token refresh** - Transparent to users  
✅ **HTTPS enforcement** - Secure data transmission  
✅ **State parameter** - CSRF protection

## Troubleshooting

### "OAuth not configured" error

**Problem**: `OUTLOOK_CLIENT_ID` or `OUTLOOK_CLIENT_SECRET` not set  
**Solution**: Add environment variables to your `.env` file and restart backend

### "Invalid redirect URI" error

**Problem**: Redirect URI in Azure doesn't match backend URL  
**Solution**: 
1. Check `BACKEND_URL` environment variable
2. Ensure `{BACKEND_URL}/api/auth/outlook/callback` is added in Azure Portal
3. Match exactly (including http/https, port)

### "Failed to obtain refresh token" error

**Problem**: `offline_access` scope not granted  
**Solution**:
1. Go to Azure Portal → App registrations → API permissions
2. Ensure `offline_access` is added
3. Grant admin consent
4. Reconnect Outlook

### "Token expired" errors after some time

**Problem**: Refresh token not working  
**Solution**:
1. Check `OUTLOOK_CLIENT_SECRET` is correct
2. Ensure refresh token is stored in database (not null)
3. Check backend logs for refresh errors
4. Verify Azure app registration is still active

### Email sending fails with 401 Unauthorized

**Problem**: Access token expired and refresh failed  
**Solution**:
1. Check if `outlook_refresh_token` exists in database
2. Verify `OUTLOOK_CLIENT_SECRET` is correct
3. User may need to reconnect Outlook

## Testing Checklist

- [ ] Azure app registration created
- [ ] Redirect URI configured in Azure
- [ ] API permissions granted (`Mail.Send`, `User.Read`, `offline_access`)
- [ ] Client secret generated and saved
- [ ] Backend environment variables set
- [ ] Backend restarted/redeployed
- [ ] User can click "Connect Outlook"
- [ ] Microsoft login page appears
- [ ] After authorization, redirects to profile with success message
- [ ] User email shown as "Connected"
- [ ] Can send test email from Interview Coordinator
- [ ] Token refresh works after expiration (test after 1 hour)

## API Endpoints

### GET /api/auth/outlook/auth
**Purpose**: Initiate OAuth flow  
**Auth**: Required (JWT token)  
**Returns**: `{ success: true, authUrl: "https://..." }`

### GET /api/auth/outlook/callback
**Purpose**: OAuth callback handler  
**Auth**: None (public endpoint)  
**Query Params**: `code`, `state`, `error`, `error_description`  
**Redirects**: Frontend profile page with status

### GET /api/auth/outlook/status
**Purpose**: Check connection status  
**Auth**: Required (JWT token)  
**Returns**: `{ success: true, isConnected: true, isExpired: false, email: "user@example.com" }`

### POST /api/auth/outlook/disconnect
**Purpose**: Disconnect Outlook  
**Auth**: Required (JWT token)  
**Returns**: `{ success: true, message: "..." }`

## Additional Resources

- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [Microsoft Graph Mail API](https://docs.microsoft.com/en-us/graph/api/user-sendmail)

## Support

If you encounter issues:
1. Check backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Azure app configuration matches this guide
4. Test with a fresh browser session (clear cache/cookies)
