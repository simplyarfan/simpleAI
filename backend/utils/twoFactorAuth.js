const crypto = require('crypto');

/**
 * Two-Factor Authentication Utility
 * Handles OTP generation, verification, and expiry management
 */
class TwoFactorAuth {
  /**
   * Generate a 6-digit OTP
   * @returns {string} 6-digit OTP code
   */
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * Get OTP expiry time (10 minutes from now)
   * @returns {Date} Expiry timestamp
   */
  static getExpiryTime() {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }
  
  /**
   * Verify OTP code
   * @param {string} inputCode - Code entered by user
   * @param {string} storedCode - Code stored in database
   * @param {Date} expiryTime - Code expiry timestamp
   * @returns {Object} Verification result with valid flag and reason
   */
  static verifyOTP(inputCode, storedCode, expiryTime) {
    if (!storedCode || !expiryTime) {
      return { valid: false, reason: 'NO_CODE' };
    }
    
    const now = new Date();
    const expiry = new Date(expiryTime);
    
    if (now > expiry) {
      return { valid: false, reason: 'EXPIRED' };
    }
    
    if (inputCode !== storedCode) {
      return { valid: false, reason: 'INVALID' };
    }
    
    return { valid: true };
  }
  
  /**
   * Generate a secret for authenticator apps (future enhancement)
   * @param {string} email - User email
   * @returns {string} Base32 encoded secret
   */
  static generateSecret(email) {
    const secret = crypto.randomBytes(20).toString('hex');
    return secret;
  }
}

module.exports = TwoFactorAuth;
