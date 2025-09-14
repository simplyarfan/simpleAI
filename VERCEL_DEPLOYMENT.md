# Vercel Deployment Guide

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

```
JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_long_and_random_123456789
REFRESH_TOKEN_SECRET=another_super_secure_refresh_token_secret_different_from_jwt_987654321
NODE_ENV=production
DATABASE_URL=file:./database.sqlite
OPENAI_API_KEY=your_openai_api_key_here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Backend Deployment Steps

1. **Go to vercel.com**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Find and select** `simplyarfan/simpleAI` repository
5. **Configure the project:**
   - Framework Preset: Other
   - Root Directory: `backend` ⚠️ (Very important!)
   - Build Command: `npm install`
   - Output Directory: (leave empty)
   - Install Command: `npm install`

6. **Add Environment Variables** (click "Environment Variables" tab):
   ```
   JWT_SECRET=enterprise_ai_hub_jwt_secret_super_secure_123456789
   REFRESH_TOKEN_SECRET=enterprise_ai_hub_refresh_secret_987654321
   NODE_ENV=production
   DATABASE_URL=file:./database.sqlite
   OPENAI_API_KEY=your_openai_api_key_here
   JWT_EXPIRES_IN=24h
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

7. **Click Deploy!**

## Frontend Deployment (Separate Project)

1. **Create another Vercel project**
2. **Select the same repository** `simplyarfan/simpleAI`
3. **Configure:**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=https://your-frontend-url.vercel.app
   ```

## Custom Verification System

The authentication system has been updated to remove Gmail dependency:

### How it works:
1. **Registration**: User gets a 6-digit verification code
2. **Verification**: User enters the code to verify their account
3. **No Email Required**: Code is displayed in the response (in production, send via SMS/email service)

### API Endpoints:
- `POST /api/auth/register` - Returns verification code
- `POST /api/auth/verify-email` - Verify with code
- `POST /api/auth/resend-verification` - Get new code

### Frontend Integration:
Update your registration flow to:
1. Show the verification code after registration
2. Provide input field for code entry
3. Call verify-email endpoint with email + code

## Production Considerations

For production deployment, replace the verification system with:
- **SMS Service**: Twilio, AWS SNS
- **Email Service**: SendGrid, Mailgun, AWS SES
- **Push Notifications**: Firebase, OneSignal

The current system shows the code in the API response for development purposes.
