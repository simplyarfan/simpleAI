/**
 * Simple Email Service for Authentication Emails
 * Uses SMTP for 2FA codes and password reset links
 * Fallback to console logging if SMTP not configured
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_USER || 'noreply@securemaxtech.com';
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter - lazy initialization (don't crash on startup)
   */
  initializeTransporter() {
    console.log('🔍 [EMAIL] Initializing email service...');
    console.log('🔍 [EMAIL] EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'MISSING');
    console.log('🔍 [EMAIL] EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
    console.log('🔍 [EMAIL] EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com (default)');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ [EMAIL] CRITICAL: Email credentials not configured');
      console.error('❌ [EMAIL] Set EMAIL_USER and EMAIL_PASS in Vercel environment variables');
      console.error('❌ [EMAIL] Email sending will FAIL until credentials are added');
      // DON'T throw - let the service initialize but fail when trying to send
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        // Fail fast - no retries
        pool: false,
        maxConnections: 1
      });
      
      console.log('✅ [EMAIL] SMTP transporter created successfully');
      console.log('✅ [EMAIL] Using:', process.env.EMAIL_USER);
    } catch (error) {
      console.error('❌ [EMAIL] FATAL: Failed to create SMTP transporter:', error.message);
      throw error;
    }
  }

  /**
   * Send 2FA verification code
   */
  async send2FACode(email, code, firstName) {
    const subject = 'Your Verification Code - Enterprise AI Hub';
    const html = this.generate2FATemplate(code, firstName);

    return await this.sendEmail(email, subject, html);
  }

  /**
   * Send password reset link
   */
  async sendPasswordReset(email, token, firstName) {
    const resetLink = `${process.env.FRONTEND_URL || 'https://thesimpleai.netlify.app'}/auth/reset-password?token=${token}`;
    const subject = 'Password Reset Request - Enterprise AI Hub';
    const html = this.generatePasswordResetTemplate(resetLink, firstName);

    return await this.sendEmail(email, subject, html);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, firstName) {
    const subject = 'Welcome to Enterprise AI Hub';
    const html = this.generateWelcomeTemplate(firstName);

    return await this.sendEmail(email, subject, html);
  }

  /**
   * Core email sending function - NO FALLBACKS, FAIL PROPERLY
   */
  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      const error = new Error('Email service not initialized - missing credentials');
      console.error('❌ [EMAIL] Cannot send email - transporter not initialized');
      throw error;
    }

    try {
      console.log(`📧 [EMAIL] Sending to: ${to}`);
      console.log(`📧 [EMAIL] Subject: ${subject}`);
      
      const info = await this.transporter.sendMail({
        from: `"Enterprise AI Hub" <${this.from}>`,
        to,
        subject,
        html
      });

      console.log('✅ [EMAIL] Successfully sent:', info.messageId);
      console.log('✅ [EMAIL] Response:', info.response);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ [EMAIL] FAILED to send email:', error.message);
      console.error('❌ [EMAIL] Error details:', error);
      // Throw the error - let the caller handle it
      throw error;
    }
  }

  /**
   * Generate 2FA email template
   */
  generate2FATemplate(code, firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background: #f3f4f6;
            }
            .container { 
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 32px; 
              text-align: center;
            }
            .content { 
              padding: 40px;
            }
            .code-box {
              background: #f9fafb;
              border: 2px dashed #e5e7eb;
              padding: 24px;
              border-radius: 12px;
              text-align: center;
              margin: 24px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #f97316;
              font-family: 'Courier New', monospace;
            }
            .footer { 
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">🔐 Verification Code</h1>
            </div>
            <div class="content">
                <p>Hi ${firstName || 'there'},</p>
                <p>You requested a verification code to sign in to your Enterprise AI Hub account.</p>
                <div class="code-box">
                    <div class="code">${code}</div>
                    <p style="margin: 8px 0 0 0; color: #6b7280;">Valid for 10 minutes</p>
                </div>
                <p>If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.</p>
            </div>
            <div class="footer">
                <p style="margin: 0;">Enterprise AI Hub - SecureMaxTech</p>
                <p style="margin: 8px 0 0 0;">This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate password reset email template
   */
  generatePasswordResetTemplate(resetLink, firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background: #f3f4f6;
            }
            .container { 
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 32px; 
              text-align: center;
            }
            .content { 
              padding: 40px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white !important;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 24px 0;
            }
            .footer { 
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">🔑 Password Reset</h1>
            </div>
            <div class="content">
                <p>Hi ${firstName || 'there'},</p>
                <p>We received a request to reset your password for your Enterprise AI Hub account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reset Password</a>
                </div>
                <p>This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">${resetLink}</span>
                </p>
            </div>
            <div class="footer">
                <p style="margin: 0;">Enterprise AI Hub - SecureMaxTech</p>
                <p style="margin: 8px 0 0 0;">This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate welcome email template
   */
  generateWelcomeTemplate(firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333;
              margin: 0;
              padding: 0;
              background: #f3f4f6;
            }
            .container { 
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 32px; 
              text-align: center;
            }
            .content { 
              padding: 40px;
            }
            .footer { 
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">🎉 Welcome!</h1>
            </div>
            <div class="content">
                <p>Hi ${firstName},</p>
                <p>Welcome to <strong>Enterprise AI Hub</strong>! Your account has been successfully created.</p>
                <p>You now have access to our powerful AI-driven tools including CV Intelligence and Interview Coordinator.</p>
                <p>Get started by logging in and exploring the platform.</p>
            </div>
            <div class="footer">
                <p style="margin: 0;">Enterprise AI Hub - SecureMaxTech</p>
            </div>
        </div>
    </body>
    </html>`;
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
