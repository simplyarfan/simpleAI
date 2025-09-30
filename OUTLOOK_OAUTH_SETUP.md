# Outlook Email OAuth Setup Guide

This guide explains how to set up Outlook OAuth integration for sending interview emails from your company email (example@securemaxtech.com).

## Why Outlook OAuth is Needed

Outlook OAuth allows the Interview Coordinator to:
- Send interview emails from your company Outlook account
- Maintain professional branding with your company email
- Attach .ics calendar files automatically
- Send emails with your signature and company formatting

## Step 1: Register App in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **"Azure Active Directory"** → **"App registrations"**
3. Click **"New registration"**

### App Registration Details:
- **Name:** `Interview Coordinator`
- **Supported account types:** `Accounts in this organizational directory only (Single tenant)`
- **Redirect URI:** 
  - Platform: `Single-page application (SPA)`
  - URI: `https://thesimpleai.netlify.app`
  - For local development: `http://localhost:3000`

4. Click **"Register"**

## Step 2: Configure API Permissions

1. In your app, go to **"API permissions"**
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"**
4. Select **"Delegated permissions"**
5. Add these permissions:
   - `Mail.Send` - Send mail as a user
   - `User.Read` - Sign in and read user profile

6. Click **"Add permissions"**
7. Click **"Grant admin consent for [Your Organization]"** (requires admin rights)

## Step 3: Get Application (Client) ID

1. Go to **"Overview"** in your app registration
2. Copy the **Application (client) ID** 
   - Example: `12345678-1234-1234-1234-123456789abc`

## Step 4: Add Environment Variables

### For Local Development:
Add to `/frontend/.env.local`:
```env
NEXT_PUBLIC_OUTLOOK_CLIENT_ID=your-application-id-here
```

### For Netlify Production:
1. Go to Netlify dashboard → Site settings → Environment variables
2. Add:
   - **Key:** `NEXT_PUBLIC_OUTLOOK_CLIENT_ID`
   - **Value:** Your Application ID from Azure

## Step 5: Test the Integration

1. **Restart your dev server** after adding environment variables
2. Go to **Profile Settings** → **Email Integration** tab
3. Click **"Connect Outlook"**
4. You should see Microsoft OAuth consent screen
5. Sign in with your company email (example@securemaxtech.com)
6. Grant permissions
7. You'll be redirected back with success message

## Step 6: Configure Company Email Domain (Optional)

If you want to restrict to only your company domain:

1. In Azure Portal → Your app → **Authentication**
2. Under **Advanced settings**, configure:
   - **Supported account types:** `Accounts in this organizational directory only`
   - This ensures only @securemaxtech.com accounts can connect

## Troubleshooting

### "Application not found" error
- Make sure `NEXT_PUBLIC_OUTLOOK_CLIENT_ID` is set correctly
- Restart your development server
- Check that the Application ID matches exactly

### "Redirect URI mismatch" error
- Ensure redirect URIs in Azure match your app URL exactly
- For local: `http://localhost:3000`
- For production: `https://thesimpleai.netlify.app`

### "Permissions not granted" error
- Make sure admin consent was granted in Azure Portal
- Check that Mail.Send and User.Read permissions are added
- Contact your Azure administrator if needed

### "CORS or CSP errors"
- These are normal if OAuth is not configured
- Once you add the client ID, errors will disappear

## Security Notes

- The `NEXT_PUBLIC_OUTLOOK_CLIENT_ID` is safe to expose (it's meant to be public)
- Actual authentication happens on Microsoft servers
- Users must authenticate with their company credentials
- No passwords or secrets are stored in your application

## Email Features

Once connected, the system will:
- ✅ Send emails from your connected Outlook account
- ✅ Include professional company signature
- ✅ Attach .ics calendar files automatically
- ✅ Maintain company branding and formatting
- ✅ Work with any calendar app (Outlook, Google, Apple, etc.)

## For IT Administrators

### Required Permissions:
- Application registration rights in Azure AD
- Permission to grant admin consent for Mail.Send
- Access to configure app authentication settings

### Security Considerations:
- App uses delegated permissions (user context)
- No application-level permissions required
- Users authenticate with their own credentials
- Follows Microsoft OAuth 2.0 best practices

## Need Help?

If you encounter issues:
1. Verify Application ID is correct in environment variables
2. Check redirect URIs match exactly
3. Ensure admin consent is granted
4. Test with a company email account
5. Check browser console for specific error messages

The system will show helpful error messages to guide you through any configuration issues.
