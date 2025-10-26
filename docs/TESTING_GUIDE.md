# Testing Guide - Enterprise AI Hub Authentication Features

## 🧪 Comprehensive Testing Plan

This guide provides step-by-step instructions to test all implemented features.

---

## Prerequisites

### 1. Environment Setup
```bash
# Backend
cd backend
npm install nodemailer
cp .env.example .env  # If you have one

# Add to .env (optional for email testing):
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@securemaxtech.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000

# Frontend
cd frontend
npm install
```

### 2. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Test Suite 1: Database Integration ✅

### Verify Database Schema
```sql
-- Connect to your PostgreSQL database
psql -d your_database_name

-- Check if 2FA columns exist
\d users

-- Expected columns:
-- - two_factor_enabled (BOOLEAN)
-- - two_factor_code (TEXT)
-- - two_factor_code_expires_at (TIMESTAMPTZ)
-- - reset_token (TEXT)
-- - reset_token_expiry (TIMESTAMPTZ)
```

### Create Test User
```sql
-- Create a test user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified, created_at, updated_at)
VALUES (
  'test@securemaxtech.com',
  '$2a$12$YourHashedPasswordHere',  -- You'll need to hash a password
  'Test',
  'User',
  'user',
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Verify user created
SELECT id, email, first_name, two_factor_enabled FROM users WHERE email = 'test@securemaxtech.com';
```

---

## Test Suite 2: Backend API Endpoints ✅

### Test 1: Standard Login (Without 2FA)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@securemaxtech.com",
    "password": "yourpassword"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "token": "eyJhbG...",
#   "refreshToken": "eyJhbG...",
#   "user": { ... }
# }
```

### Test 2: Enable 2FA
```bash
# First, get your access token from login above
TOKEN="your_access_token_here"

curl -X POST http://localhost:5000/api/auth/enable-2fa \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
# {
#   "success": true,
#   "message": "Two-factor authentication enabled"
# }
```

### Test 3: Verify 2FA Enabled in Database
```sql
SELECT email, two_factor_enabled FROM users WHERE email = 'test@securemaxtech.com';

-- Expected:
-- two_factor_enabled | true
```

### Test 4: Login with 2FA (Triggers Code)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@securemaxtech.com",
    "password": "yourpassword"
  }'

# Expected Response:
# {
#   "success": true,
#   "requires2FA": true,
#   "userId": "123",
#   "message": "Verification code sent to your email"
# }
```

### Test 5: Check Console for 2FA Code
```bash
# Look at your backend terminal for:
# 📧 ===== EMAIL (Dev Mode) =====
# To: test@securemaxtech.com
# Subject: Your Verification Code - Enterprise AI Hub
# HTML Content: ...
# ================================

# Extract the 6-digit code from the HTML
```

### Test 6: Verify 2FA Code
```bash
# Get userId from Test 4 response
USER_ID="123"
CODE="456789"  # From backend console

curl -X POST http://localhost:5000/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "code": "'$CODE'"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "token": "eyJhbG...",
#   "refreshToken": "eyJhbG...",
#   "user": { ... }
# }
```

### Test 7: Resend 2FA Code
```bash
# Login again to trigger 2FA
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@securemaxtech.com",
    "password": "yourpassword"
  }'

# Get userId from response
USER_ID="123"

# Resend code
curl -X POST http://localhost:5000/api/auth/resend-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "A new verification code has been sent to your email"
# }

# Try resending again immediately (should fail - rate limit)
curl -X POST http://localhost:5000/api/auth/resend-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'"
  }'

# Expected Response (429):
# {
#   "success": false,
#   "message": "Please wait before requesting a new code"
# }
```

### Test 8: Forgot Password Flow
```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@securemaxtech.com"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "If an account exists with this email, a password reset link has been sent"
# }

# Check backend console for reset token in HTML
# Extract token from: http://localhost:3000/auth/reset-password?token=RESET_TOKEN

# Reset password with token
RESET_TOKEN="token_from_console"

curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$RESET_TOKEN'",
    "newPassword": "newpassword123"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Password reset successful. Please log in with your new password."
# }
```

### Test 9: Disable 2FA
```bash
# Login to get token
TOKEN="your_access_token"

curl -X POST http://localhost:5000/api/auth/disable-2fa \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Two-factor authentication disabled"
# }
```

---

## Test Suite 3: Frontend Integration ✅

### Manual Testing Steps

#### Test 1: Standard Login
1. Open browser to `http://localhost:3000/auth/login`
2. Enter email: `test@securemaxtech.com`
3. Enter password: `newpassword123`
4. **Don't** check "Remember me"
5. Click "Sign in"
6. **Expected:** Redirect to dashboard
7. **Verify:** User logged in successfully

#### Test 2: Remember Me
1. Go to `http://localhost:3000/auth/login`
2. Enter credentials
3. **Check** "Remember me" checkbox
4. Click "Sign in"
5. Close browser completely
6. Reopen browser to `http://localhost:3000/auth/login`
7. **Expected:** Email field pre-filled
8. **Verify:** `localStorage.getItem('rememberedEmail')` shows email

#### Test 3: Enable 2FA in Profile
1. Login to application
2. Navigate to Profile → Security tab
3. Find "Two-Factor Authentication" section
4. Toggle switch to **ON**
5. **Expected:** Toast message "Two-factor authentication enabled"
6. **Verify:** "Active" badge appears

#### Test 4: Login with 2FA
1. Logout
2. Go to login page
3. Enter credentials
4. Click "Sign in"
5. **Expected:** Redirect to `/auth/verify-2fa?userId=123`
6. **Check:** Backend console for 6-digit code
7. Enter the 6 digits (auto-focus should work)
8. **Expected:** Auto-submit when complete or click "Verify Code"
9. **Verify:** Logged in successfully

#### Test 5: Resend Code
1. Trigger 2FA login (repeat Test 4 steps 1-5)
2. On verification page, click "Resend code"
3. **Expected:** 
   - Toast message "A new code has been sent"
   - Input fields cleared
   - Button disabled for 60 seconds
   - Countdown timer visible
4. Wait 60 seconds
5. **Expected:** Button enabled again

#### Test 6: Invalid Code
1. Trigger 2FA login
2. Enter wrong code: `000000`
3. **Expected:** Toast error "Invalid or expired verification code"
4. **Verify:** Input fields remain, can retry

#### Test 7: Forgot Password Frontend
1. Go to login page
2. Click "Forgot your password?"
3. **Expected:** Redirect to `/auth/forgot-password`
4. Enter email: `test@securemaxtech.com`
5. Click "Send Reset Link"
6. **Expected:** Success page with instructions
7. Check backend console for reset link
8. Click link (or manually navigate)
9. **Expected:** Redirect to `/auth/reset-password?token=...`
10. Enter new password (twice)
11. Click "Reset Password"
12. **Expected:** Success page with "Go to Login" button
13. Click button and login with new password

#### Test 8: Disable 2FA in Profile
1. Login with 2FA enabled
2. Navigate to Profile → Security tab
3. Toggle 2FA switch to **OFF**
4. **Expected:** Browser prompt for password
5. Enter password
6. **Expected:** Toast message "Two-factor authentication disabled"
7. **Verify:** "Active" badge disappears

#### Test 9: Error Handling
1. Try login with wrong password
2. **Expected:** Toast error with clear message
3. Try enabling 2FA without auth token
4. **Expected:** Redirect to login or error message
5. Try accessing protected route without login
6. **Expected:** Redirect to login

---

## Test Suite 4: Integration Validation ✅

### Validate File Imports
```bash
# Check if all imports are correct
cd backend

# Verify 2FA utility is importable
node -e "console.log(require('./utils/twoFactorAuth'))"

# Verify email service is importable
node -e "console.log(require('./services/emailService'))"

# Verify error handler is importable
node -e "console.log(require('./middleware/errorHandler'))"

# Check frontend components
cd ../frontend

# This will show if there are import errors
npm run build
```

### Validate Database Connections
```bash
# Start backend and check logs
cd backend
npm run dev

# Look for:
# ✅ Database connection established
# ✅ Email service initialized
# ✅ User table indexes created
```

---

## Test Suite 5: Security Validation ✅

### Test 1: Rate Limiting
```bash
# Try to login 10 times quickly with wrong password
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@securemaxtech.com", "password": "wrong"}'
  echo "Attempt $i"
done

# Expected: After 5 attempts, should get account locked message
```

### Test 2: Token Expiration
```bash
# This test requires waiting or manually setting expired token
# Create a JWT with short expiration for testing
```

### Test 3: SQL Injection Prevention
```bash
# Try SQL injection in login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@securemaxtech.com\" OR \"1\"=\"1",
    "password": "anything"
  }'

# Expected: Normal "Invalid credentials" response, not SQL error
```

---

## Test Suite 6: Email Service ✅

### Test Development Mode (No SMTP)
1. Make sure `EMAIL_USER` and `EMAIL_PASS` are NOT in `.env`
2. Restart backend
3. Trigger 2FA login
4. **Expected:** Backend console shows:
   ```
   ⚠️ Email credentials not configured. Emails will be logged to console.
   📧 ===== EMAIL (Dev Mode) =====
   To: test@securemaxtech.com
   Subject: Your Verification Code - Enterprise AI Hub
   ...
   ```

### Test Production Mode (With SMTP)
1. Add valid Gmail credentials to `.env`
2. Restart backend
3. Trigger 2FA login
4. **Expected:** 
   - Backend console: "✅ Email sent: <message-id>"
   - Email received in inbox

---

## Test Suite 7: Error Scenarios ✅

### Test Invalid 2FA Code
```bash
curl -X POST http://localhost:5000/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "code": "000000"
  }'

# Expected: 401 with error message
```

### Test Expired Reset Token
```bash
# Manually set expired token in database
UPDATE users SET reset_token_expiry = NOW() - INTERVAL '2 hours' WHERE email = 'test@securemaxtech.com';

# Try to reset
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "expired_token",
    "newPassword": "newpass"
  }'

# Expected: 400 with "Invalid or expired reset token"
```

---

## Automated Test Script

Create this file for quick validation:

```bash
#!/bin/bash
# test-auth-flow.sh

echo "🧪 Testing Enterprise AI Hub Authentication..."

BASE_URL="http://localhost:5000/api"
EMAIL="test@securemaxtech.com"
PASSWORD="testpassword123"

echo ""
echo "1️⃣ Testing Login..."
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo $RESPONSE | grep -q "success.*true"; then
  echo "✅ Login successful"
  TOKEN=$(echo $RESPONSE | jq -r '.token')
else
  echo "❌ Login failed"
  echo $RESPONSE
  exit 1
fi

echo ""
echo "2️⃣ Testing Enable 2FA..."
RESPONSE=$(curl -s -X POST $BASE_URL/auth/enable-2fa \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo $RESPONSE | grep -q "success.*true"; then
  echo "✅ 2FA enabled"
else
  echo "❌ Enable 2FA failed"
  echo $RESPONSE
fi

echo ""
echo "3️⃣ Testing Login with 2FA..."
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo $RESPONSE | grep -q "requires2FA.*true"; then
  echo "✅ 2FA triggered"
  USER_ID=$(echo $RESPONSE | jq -r '.userId')
  echo "User ID: $USER_ID"
else
  echo "❌ 2FA not triggered"
  echo $RESPONSE
fi

echo ""
echo "✅ Basic flow tests complete!"
echo "📧 Check backend console for 2FA code to continue manual testing"
```

Save and run:
```bash
chmod +x test-auth-flow.sh
./test-auth-flow.sh
```

---

## Checklist Summary

### Backend ✅
- [ ] Server starts without errors
- [ ] Database columns exist
- [ ] Login endpoint works
- [ ] 2FA enable endpoint works
- [ ] 2FA verify endpoint works
- [ ] Resend code works with rate limit
- [ ] Password reset request works
- [ ] Password reset completion works
- [ ] Email service logs to console (dev mode)

### Frontend ✅
- [ ] Login page loads
- [ ] Remember me checkbox works
- [ ] 2FA redirect works
- [ ] Verification page UI functions
- [ ] Auto-focus works
- [ ] Paste support works
- [ ] Resend button works with timer
- [ ] Profile 2FA toggle works
- [ ] Forgot password flow complete

### Integration ✅
- [ ] Frontend calls backend correctly
- [ ] Tokens stored in localStorage
- [ ] AuthContext updates properly
- [ ] Toast notifications appear
- [ ] Redirects work correctly

---

## Troubleshooting

### Issue: Backend won't start
```bash
# Check for port conflicts
lsof -i :5000
kill -9 <PID>

# Check dependencies
cd backend && npm install
```

### Issue: Frontend won't build
```bash
# Clear cache
rm -rf .next
npm run build
```

### Issue: Database connection fails
```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: 2FA code not showing
```bash
# Check backend console output
# Ensure EMAIL_USER and EMAIL_PASS are NOT set (for dev testing)
# Or ensure they ARE set correctly (for prod testing)
```

---

## Success Criteria

All tests pass when:
1. ✅ Backend starts without errors
2. ✅ All API endpoints return expected responses
3. ✅ Database queries execute successfully
4. ✅ Frontend pages load without console errors
5. ✅ Complete login flow works (with and without 2FA)
6. ✅ Password reset flow completes
7. ✅ Remember me persists across sessions
8. ✅ Rate limiting prevents abuse
9. ✅ Error handling shows appropriate messages
10. ✅ Email service functions (console or SMTP)

---

## Next Steps After Testing

1. Fix any issues found during testing
2. Test with real SMTP credentials
3. Test on production-like environment
4. Perform load testing if needed
5. Security audit
6. User acceptance testing
7. Deploy to production

---

**Happy Testing! 🚀**
