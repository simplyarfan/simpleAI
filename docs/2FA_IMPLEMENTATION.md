# Two-Factor Authentication (2FA) Implementation

## Overview

Two-factor authentication has been implemented using email-based one-time passwords (OTP). When enabled, users will receive a 6-digit verification code via email after entering their password during login.

---

## Features Implemented

### Backend

1. **Database Schema** (`backend/models/database.js`)
   - Added columns to `users` table:
     - `two_factor_enabled` (BOOLEAN) - Whether 2FA is enabled for the user
     - `two_factor_code` (TEXT) - Hashed verification code
     - `two_factor_code_expires_at` (TIMESTAMPTZ) - Code expiration timestamp

2. **2FA Utility** (`backend/utils/twoFactorAuth.js`)
   - `generate2FACode()` - Generates 6-digit OTP with 10-minute expiration
   - `verify2FACode()` - Verifies OTP against hashed code and expiration

3. **Email Service** (`backend/services/emailService.js`)
   - SMTP-based email service using Nodemailer
   - Fallback to console logging in development (no SMTP config needed)
   - Methods:
     - `send2FACode()` - Send verification code
     - `sendPasswordReset()` - Send password reset link (prepared for Phase 2)
     - `sendWelcomeEmail()` - Welcome email for new users
   - Professional HTML email templates with branding

4. **Authentication Controller** (`backend/controllers/AuthController.js`)
   - Updated `login()` to check if 2FA is enabled and send verification code
   - New `verify2FA()` endpoint to validate OTP and complete login
   - New `enable2FA()` endpoint to enable 2FA for a user
   - New `disable2FA()` endpoint to disable 2FA (requires password)

5. **Routes** (`backend/routes/auth.js`)
   - `POST /api/auth/verify-2fa` - Verify 2FA code
   - `POST /api/auth/enable-2fa` - Enable 2FA (authenticated)
   - `POST /api/auth/disable-2fa` - Disable 2FA (authenticated, requires password)

### Frontend

1. **Verification Page** (`frontend/src/pages/auth/verify-2fa.js`)
   - Clean 6-digit code input UI with auto-focus
   - Auto-submit when all digits entered
   - Paste support for easy code entry
   - Resend code button (placeholder for Phase 2)
   - Professional UX with loading states

2. **Updated Login Flow** (`frontend/src/pages/auth/login.js`)
   - Detects 2FA requirement from login response
   - Redirects to verification page with userId

3. **Auth Context** (`frontend/src/contexts/AuthContext.js`)
   - Updated `login()` to handle 2FA redirect response

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install nodemailer
```

### 2. Environment Variables

Add to `backend/.env`:

```bash
# Email Service (Optional - falls back to console logging)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@securemaxtech.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL (used in password reset emails)
FRONTEND_URL=https://thesimpleai.netlify.app
```

**Note:** If `EMAIL_USER` and `EMAIL_PASS` are not set, the email service will log verification codes to the console (perfect for development).

### Gmail App Password Setup (if using Gmail SMTP)

1. Enable 2-Step Verification on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use this app password as `EMAIL_PASS`

### 3. Database Migration

The database columns will be automatically created on server startup (auto-migration is already implemented in `database.js`). No manual migration needed.

To manually verify the columns exist:

```sql
SELECT two_factor_enabled, two_factor_code, two_factor_code_expires_at 
FROM users 
LIMIT 1;
```

---

## Usage

### Enable 2FA for a User

**Option 1: Via API (User Self-Service)**

```bash
POST /api/auth/enable-2fa
Authorization: Bearer <access_token>
```

Response:
```json
{
  "success": true,
  "message": "Two-factor authentication enabled"
}
```

**Option 2: Via Database (Admin)**

```sql
UPDATE users 
SET two_factor_enabled = true 
WHERE email = 'user@securemaxtech.com';
```

### Disable 2FA for a User

**Option 1: Via API (User Self-Service)**

```bash
POST /api/auth/disable-2fa
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "user_password"
}
```

**Option 2: Via Database (Admin)**

```sql
UPDATE users 
SET two_factor_enabled = false,
    two_factor_code = NULL,
    two_factor_code_expires_at = NULL
WHERE email = 'user@securemaxtech.com';
```

---

## User Flow

### Login with 2FA Enabled

1. User enters email and password on `/auth/login`
2. Backend validates credentials
3. If 2FA enabled:
   - Backend generates 6-digit OTP
   - Stores hashed OTP in database with 10-minute expiration
   - Sends OTP via email
   - Returns `{ success: true, requires2FA: true, userId: "..." }`
4. Frontend redirects to `/auth/verify-2fa?userId=...`
5. User enters 6-digit code
6. Backend verifies code
7. If valid:
   - Clears 2FA code from database
   - Generates access and refresh tokens
   - Returns tokens and user data
8. Frontend stores tokens and redirects to dashboard

### Login without 2FA

Standard login flow (unchanged):
1. User enters credentials
2. Backend validates and returns tokens immediately
3. Frontend stores tokens and redirects

---

## API Reference

### Verify 2FA Code

**Endpoint:** `POST /api/auth/verify-2fa`

**Request:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@securemaxtech.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired verification code"
}
```

### Enable 2FA

**Endpoint:** `POST /api/auth/enable-2fa`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Two-factor authentication enabled"
}
```

### Disable 2FA

**Endpoint:** `POST /api/auth/disable-2fa`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "password": "user_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Two-factor authentication disabled"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

## Security Features

1. **Code Hashing:** OTP codes are hashed with bcrypt before storage (not stored in plain text)
2. **Short Expiration:** Codes expire after 10 minutes
3. **Single Use:** Codes are cleared from database after successful verification
4. **Rate Limiting:** Auth endpoints protected by rate limiting middleware
5. **Password Required:** Disabling 2FA requires password re-authentication

---

## Testing

### Development Testing (Without SMTP)

If `EMAIL_USER` and `EMAIL_PASS` are not configured, the verification code will be logged to the backend console:

```
📧 ===== EMAIL (Dev Mode) =====
To: user@securemaxtech.com
Subject: Your Verification Code - Enterprise AI Hub
HTML Content: ...
================================
```

You can copy the 6-digit code from the email HTML and use it for testing.

### Production Testing (With SMTP)

1. Configure SMTP credentials in `.env`
2. Enable 2FA for a test user
3. Attempt login
4. Check email inbox (and spam folder)
5. Enter the 6-digit code on the verification page

---

## Frontend UI Features

### Verification Page (`/auth/verify-2fa`)

- **Auto-focus:** Automatically focuses next input field as you type
- **Auto-submit:** Submits form when all 6 digits are entered
- **Paste support:** Paste 6-digit code directly (e.g., from email)
- **Back navigation:** Easy return to login page
- **Responsive design:** Works on mobile and desktop
- **Loading states:** Visual feedback during verification
- **Error handling:** Clear error messages for invalid/expired codes

---

## Next Steps (Future Phases)

### Phase 2: Password Reset Flow
- Implement `requestPasswordReset()` controller method
- Add database columns for reset tokens
- Create frontend pages: forgot-password, reset-password
- Email service method already prepared: `sendPasswordReset()`

### Phase 3: Remember Me
- Extend refresh token expiration for "remember me" option
- Add checkbox to login form
- Store preference in session

### Phase 4: 2FA Settings Page
- User profile section to enable/disable 2FA
- Show 2FA status
- Test 2FA code sending

### Phase 5: Backup Codes
- Generate backup codes for 2FA recovery
- Store hashed backup codes in database
- Allow single-use backup codes during verification

---

## Troubleshooting

### Email not received

1. **Check backend logs** for email sending errors
2. **Check spam folder** in email client
3. **Verify SMTP credentials** in `.env`
4. **Check Gmail security settings** if using Gmail (app passwords enabled?)
5. **Fallback:** Use console-logged code in development

### Code expired

- Codes expire after 10 minutes
- Request a new code by logging in again
- Resend functionality to be added in Phase 2

### 2FA not triggering

- Verify `two_factor_enabled = true` in database for the user
- Check backend response: should have `requires2FA: true`
- Check browser console for errors

### Database errors

- Ensure database migration ran successfully
- Manually check if columns exist:
  ```sql
  \d users
  ```
- If columns missing, restart backend server (auto-migration will run)

---

## Files Modified/Created

### Backend
- ✅ `backend/utils/twoFactorAuth.js` (created)
- ✅ `backend/services/emailService.js` (created)
- ✅ `backend/controllers/AuthController.js` (modified - added 3 methods)
- ✅ `backend/routes/auth.js` (modified - added 3 routes)
- ✅ `backend/models/database.js` (auto-migration already handles new columns)

### Frontend
- ✅ `frontend/src/pages/auth/verify-2fa.js` (created)
- ✅ `frontend/src/pages/auth/login.js` (modified)
- ✅ `frontend/src/contexts/AuthContext.js` (modified)

### Documentation
- ✅ `docs/2FA_IMPLEMENTATION.md` (this file)

---

## Credits

**Implementation Date:** 2025-10-25
**Developer:** Warp AI Agent Mode
**Project:** Enterprise AI Hub (Nexus)

---

## Support

For issues or questions:
1. Check this documentation first
2. Review backend logs for errors
3. Test with development mode (console logging) first
4. Verify database schema updates
5. Check SMTP credentials and settings

**Tip:** Enable 2FA for a single test user first before rolling out to all users.
