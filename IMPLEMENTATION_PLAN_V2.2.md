# Implementation Plan v2.2 - Complete Feature Set

## 🎯 Overview
This document outlines the implementation of 8 major features requested:
1. ✅ Directory Structure Audit
2. 🔐 Two-Factor Authentication (2FA) with Outlook
3. 🔑 Forgot Password Flow
4. ☑️ Remember Me Functionality
5. 📧 Persistent Outlook Connection UI
6. 🎨 Standardized Error Handling & UI
7. 📅 Interview Coordinator Fixes
8. 📊 CV Intelligence Ranking Bias Fix

---

## ✅ Phase 1: Directory Structure (COMPLETED)

**Status:** ✅ Audit Complete
**Files Created:**
- `DIRECTORY_AUDIT.md` - Complete analysis
- `frontend/src/constants/theme.js` - Theme constants
- `frontend/src/constants/messages.js` - Error messages & constants
- `frontend/src/hooks/` - Custom hooks directory
- `frontend/src/constants/` - Constants directory

**Verdict:** Structure is acceptable as-is. New features will be added in organized manner.

---

## 🔐 Phase 2: Two-Factor Authentication (2FA)

### Requirements:
- Generate 6-digit OTP on login
- Send OTP via Outlook email integration
- Verify OTP before allowing access
- Store 2FA preference per user

### Backend Implementation:

#### 1. Database Migration (Add 2FA columns)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_code_expires_at TIMESTAMP;
```

#### 2. Add to `backend/utils/`
**File:** `backend/utils/twoFactorAuth.js`
```javascript
const crypto = require('crypto');

class TwoFactorAuth {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * Get OTP expiry time (10 minutes from now)
   */
  static getExpiryTime() {
    return new Date(Date.now() + 10 * 60 * 1000);
  }
  
  /**
   * Verify OTP
   */
  static verifyOTP(inputCode, storedCode, expiryTime) {
    if (!storedCode || !expiryTime) {
      return { valid: false, reason: 'NO_CODE' };
    }
    
    if (new Date() > new Date(expiryTime)) {
      return { valid: false, reason: 'EXPIRED' };
    }
    
    if (inputCode !== storedCode) {
      return { valid: false, reason: 'INVALID' };
    }
    
    return { valid: true };
  }
}

module.exports = TwoFactorAuth;
```

#### 3. Modify AuthController Login Flow
**File:** `backend/controllers/AuthController.js`
**Add after password verification:**
```javascript
// After password validation succeeds

// Check if 2FA is enabled for this user
if (user.two_factor_enabled) {
  // Generate OTP
  const otp = TwoFactorAuth.generateOTP();
  const expiryTime = TwoFactorAuth.getExpiryTime();
  
  // Store OTP in database
  await database.run(`
    UPDATE users 
    SET two_factor_code = $1, two_factor_code_expires_at = $2
    WHERE id = $3
  `, [otp, expiryTime, user.id]);
  
  // Send OTP via email
  const emailService = require('../services/emailService');
  await emailService.send2FACode(user.email, otp, user.first_name);
  
  // Return 2FA required response
  return res.json({
    success: true,
    requires2FA: true,
    userId: user.id,
    message: 'Verification code sent to your email'
  });
}

// Continue with normal login flow...
```

#### 4. Add 2FA Verification Endpoint
**File:** `backend/routes/auth.js`
```javascript
router.post('/verify-2fa',
  authLimiter,
  async (req, res) => {
    const { userId, code } = req.body;
    
    // Get user with 2FA code
    const user = await database.get(`
      SELECT * FROM users 
      WHERE id = $1
    `, [userId]);
    
    // Verify OTP
    const verification = TwoFactorAuth.verifyOTP(
      code,
      user.two_factor_code,
      user.two_factor_code_expires_at
    );
    
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: verification.reason === 'EXPIRED' 
          ? 'Code has expired' 
          : 'Invalid code'
      });
    }
    
    // Clear 2FA code
    await database.run(`
      UPDATE users 
      SET two_factor_code = NULL, two_factor_code_expires_at = NULL
      WHERE id = $1
    `, [userId]);
    
    // Generate tokens and continue login
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
    
    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: ResponseOptimizer.sanitizeUser(user)
    });
  }
);
```

### Frontend Implementation:

#### 1. Create 2FA Verification Page
**File:** `frontend/src/pages/auth/verify-2fa.js`
```javascript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../../utils/api';
import { COLORS } from '../../constants/theme';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages';
import toast from 'react-hot-toast';

export default function Verify2FA() {
  const router = useRouter();
  const { userId } = router.query;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.verify2FA(userId, code);
      
      if (response.data.success) {
        toast.success(SUCCESS_MESSAGES.CODE_VERIFIED);
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || ERROR_MESSAGES.INVALID_2FA_CODE);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Verify Your Identity</h2>
        <p className="text-center text-gray-600">
          Enter the 6-digit code sent to your email
        </p>
        
        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg"
            placeholder="000000"
            required
          />
          
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### 2. Add to API Utils
**File:** `frontend/src/utils/api.js`
```javascript
export const authAPI = {
  // ... existing methods
  verify2FA: (userId, code) => api.post('/auth/verify-2fa', { userId, code }),
  enable2FA: () => api.post('/auth/enable-2fa'),
  disable2FA: () => api.post('/auth/disable-2fa'),
};
```

---

## 🔑 Phase 3: Forgot Password Flow

### Backend Implementation:

#### 1. Generate Reset Token
**File:** `backend/controllers/AuthController.js`
```javascript
static async requestPasswordReset(req, res) {
  const { email } = req.body;
  
  const user = await database.get('SELECT * FROM users WHERE email = $1', [email]);
  
  if (!user) {
    // Don't reveal if user exists
    return res.json({ 
      success: true, 
      message: 'If that email exists, a reset link was sent' 
    });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await database.run(`
    UPDATE users 
    SET reset_token = $1, reset_token_expiry = $2 
    WHERE id = $3
  `, [resetToken, resetExpiry, user.id]);
  
  // Send email with reset link
  const emailService = require('../services/emailService');
  await emailService.sendPasswordReset(user.email, resetToken, user.first_name);
  
  res.json({ success: true, message: 'Reset link sent to your email' });
}

static async resetPassword(req, res) {
  const { token, newPassword } = req.body;
  
  const user = await database.get(`
    SELECT * FROM users 
    WHERE reset_token = $1 AND reset_token_expiry > NOW()
  `, [token]);
  
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  // Update password and clear reset token
  await database.run(`
    UPDATE users 
    SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL
    WHERE id = $2
  `, [hashedPassword, user.id]);
  
  res.json({ success: true, message: 'Password reset successfully' });
}
```

### Frontend Implementation:

#### 1. Forgot Password Page
**File:** `frontend/src/pages/auth/forgot-password.js`
```javascript
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <Link href="/auth/login">
            <a className="text-orange-500 hover:text-orange-600">
              Back to Login
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center">Forgot Password?</h2>
          <p className="mt-2 text-center text-gray-600">
            Enter your email and we'll send you a reset link
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 border rounded-lg"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <div className="text-center">
            <Link href="/auth/login">
              <a className="text-orange-500 hover:text-orange-600">
                Back to Login
              </a>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## ☑️ Phase 4: Remember Me Functionality

### Implementation:

#### 1. Modify Login Form
**File:** Update login page with Remember Me checkbox
```javascript
const [rememberMe, setRememberMe] = useState(false);

// In login function:
const response = await login({ email, password, rememberMe });
```

#### 2. Backend JWT Expiration
**File:** `backend/controllers/AuthController.js`
```javascript
const generateTokens = (userId, email, role, rememberMe = false) => {
  const accessExpiry = rememberMe ? '30d' : '24h';
  const refreshExpiry = rememberMe ? '90d' : '30d';
  
  const accessToken = jwt.sign(
    { userId, email, role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: accessExpiry }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: refreshExpiry }
  );
  
  return { accessToken, refreshToken };
};
```

---

**This is Part 1 of the implementation plan. Due to length, the remaining phases (5-8) will be in a separate document: `IMPLEMENTATION_PLAN_V2.2_PART2.md`**

---

## 📋 Summary

**Completed:**
- ✅ Directory audit and constants creation
- ✅ Theme and message constants

**Next Steps:**
1. Implement 2FA (highest priority for security)
2. Implement Forgot Password
3. Add Remember Me
4. Fix Interview Coordinator
5. Fix CV ranking bias

**Estimated Time:**
- 2FA: 4-6 hours
- Forgot Password: 2-3 hours
- Remember Me: 1 hour
- Outlook UI: 2 hours
- UI Standardization: 3-4 hours
- Interview Coordinator fixes: 3-4 hours
- CV ranking fix: 2-3 hours

**Total: 17-23 hours of development**
