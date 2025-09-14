const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.setupTransporter();
  }

  setupTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service setup failed:', error);
        } else {
          console.log('Email service is ready');
        }
      });
    } catch (error) {
      console.error('Error setting up email transporter:', error);
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: {
          name: 'Enterprise AI Hub',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Convert HTML to plain text (basic implementation)
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Email templates
  getEmailTemplate(type, data) {
    const baseStyle = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6c757d; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .code { background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; font-family: monospace; font-size: 24px; text-align: center; letter-spacing: 2px; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    `;

    switch (type) {
      case 'verification':
        return `
          ${baseStyle}
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to Enterprise AI Hub</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>Welcome to Enterprise AI Hub! We're excited to have you on board.</p>
              <p>To get started, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                ${data.verificationUrl}
              </p>
              <div class="warning">
                <strong>⚠️ Security Note:</strong> This link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>Enterprise AI Hub - SecureMaxTech<br>
              If you have any questions, contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
            </div>
          </div>
        `;

      case 'password-reset':
        return `
          ${baseStyle}
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>We received a request to reset your password for your Enterprise AI Hub account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                ${data.resetUrl}
              </p>
              <div class="warning">
                <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>Enterprise AI Hub - SecureMaxTech<br>
              If you have any questions, contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
            </div>
          </div>
        `;

      case 'welcome':
        return `
          ${baseStyle}
          <div class="container">
            <div class="header">
              <h1>🎉 Account Verified Successfully!</h1>
            </div>
            <div class="content">
              <h2>Welcome ${data.name}!</h2>
              <p>Your email has been verified successfully. You now have full access to Enterprise AI Hub.</p>
              <p>Here's what you can do now:</p>
              <ul>
                <li>🤖 <strong>Access AI Agents</strong> - Use our powerful AI tools for HR, Finance, IT, and more</li>
                <li>📊 <strong>Track Analytics</strong> - Monitor your usage and efficiency gains</li>
                <li>🎯 <strong>CV Intelligence</strong> - Upload and analyze resumes with AI</li>
                <li>💬 <strong>Get Support</strong> - Submit tickets for help and suggestions</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Access Your Dashboard</a>
              </div>
              <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>Enterprise AI Hub - SecureMaxTech<br>
              Happy to have you on board! 🚀</p>
            </div>
          </div>
        `;

      case 'login-alert':
        return `
          ${baseStyle}
          <div class="container">
            <div class="header">
              <h1>🔐 New Login Alert</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name}!</h2>
              <p>We detected a new login to your Enterprise AI Hub account:</p>
              <ul>
                <li><strong>Time:</strong> ${data.loginTime}</li>
                <li><strong>Device:</strong> ${data.device}</li>
                <li><strong>Location:</strong> ${data.location || 'Unknown'}</li>
                <li><strong>IP Address:</strong> ${data.ipAddress}</li>
              </ul>
              <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately by changing your password.</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/settings/security" class="button">Review Security Settings</a>
              </div>
            </div>
            <div class="footer">
              <p>Enterprise AI Hub - SecureMaxTech<br>
              Your security is our priority 🛡️</p>
            </div>
          </div>
        `;

      default:
        throw new Error('Unknown email template type');
    }
  }

  // Send verification email
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${verificationToken}`;
    
    const htmlContent = this.getEmailTemplate('verification', {
      name: user.fullName,
      verificationUrl
    });

    return await this.sendEmail(
      user.email,
      'Verify your email address - Enterprise AI Hub',
      htmlContent
    );
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    
    const htmlContent = this.getEmailTemplate('password-reset', {
      name: user.fullName,
      resetUrl
    });

    return await this.sendEmail(
      user.email,
      'Reset your password - Enterprise AI Hub',
      htmlContent
    );
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    const htmlContent = this.getEmailTemplate('welcome', {
      name: user.fullName
    });

    return await this.sendEmail(
      user.email,
      'Welcome to Enterprise AI Hub!',
      htmlContent
    );
  }

  // Send login alert email
  async sendLoginAlertEmail(user, loginInfo) {
    const htmlContent = this.getEmailTemplate('login-alert', {
      name: user.fullName,
      loginTime: new Date(loginInfo.loginTime).toLocaleString(),
      device: loginInfo.device,
      location: loginInfo.location,
      ipAddress: loginInfo.ipAddress
    });

    return await this.sendEmail(
      user.email,
      'New login to your account - Enterprise AI Hub',
      htmlContent
    );
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;