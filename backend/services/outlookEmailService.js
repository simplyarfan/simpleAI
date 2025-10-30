/**
 * EMAIL SERVICE - Microsoft Outlook Integration
 * Handles sending emails via Microsoft Graph API with OAuth
 * Updated for multi-stage interview workflow
 */

const axios = require('axios');
const database = require('../models/database');

class OutlookEmailService {
  constructor() {
    this.graphApiUrl = 'https://graph.microsoft.com/v1.0';
  }

  /**
   * Get user's Outlook access token from database
   */
  async getUserAccessToken(userId) {
    try {
      await database.connect();
      const user = await database.get(
        'SELECT outlook_access_token, outlook_refresh_token, outlook_token_expires_at FROM users WHERE id = $1',
        [userId]
      );

      if (!user || !user.outlook_access_token) {
        throw new Error('User has not connected their Outlook account');
      }

      // Check if token is expired
      const expiresAt = new Date(user.outlook_token_expires_at);
      const now = new Date();

      if (expiresAt <= now) {
        // Token expired, need to refresh
        return await this.refreshAccessToken(userId, user.outlook_refresh_token);
      }

      return user.outlook_access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(userId, refreshToken) {
    try {
      const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', 
        new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID,
          client_secret: process.env.OUTLOOK_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.Read'
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Update tokens in database
      await database.run(
        'UPDATE users SET outlook_access_token = $1, outlook_refresh_token = $2, outlook_token_expires_at = $3 WHERE id = $4',
        [access_token, refresh_token || refreshToken, expiresAt.toISOString(), userId]
      );

      return access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Send availability request email (Stage 1)
   */
  async sendAvailabilityRequest(userId, recipientEmail, data) {
    const htmlBody = this.generateAvailabilityRequestHTML(data);

    const emailData = {
      to: [recipientEmail],
      cc: data.ccEmails || [],
      bcc: data.bccEmails || [],
      subject: data.customSubject || `Interview Opportunity - ${data.position}`,
      htmlBody: data.customContent ? this.wrapCustomContent(data.customContent) : htmlBody
    };

    return await this.sendEmail(userId, emailData);
  }

  /**
   * Send interview confirmation email with calendar invite (Stage 2)
   */
  async sendInterviewConfirmation(userId, recipientEmail, data, icsContent, cvFileBuffer = null, cvFileName = null) {
    const htmlBody = this.generateInterviewConfirmationHTML(data);

    // Prepare attachments array
    const attachments = [];
    
    // Add ICS calendar file
    if (icsContent) {
      const icsBase64 = Buffer.from(icsContent).toString('base64');
      attachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: 'interview.ics',
        contentType: 'text/calendar',
        contentBytes: icsBase64
      });
    }
    
    // Add CV attachment if provided
    if (cvFileBuffer && cvFileName) {
      const cvBase64 = cvFileBuffer.toString('base64');
      // Determine content type based on file extension
      const ext = cvFileName.split('.').pop().toLowerCase();
      const contentType = ext === 'pdf' ? 'application/pdf' : 
                          ext === 'doc' ? 'application/msword' :
                          ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
                          'application/octet-stream';
      
      attachments.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: cvFileName,
        contentType: contentType,
        contentBytes: cvBase64
      });
    }

    const emailData = {
      to: [recipientEmail],
      cc: data.ccEmails || [],
      bcc: data.bccEmails || [],
      subject: data.customSubject || `Interview Scheduled - ${data.position}`,
      htmlBody: data.customContent ? this.wrapCustomContent(data.customContent) : htmlBody,
      attachments: attachments
    };

    return await this.sendEmail(userId, emailData);
  }

  /**
   * Wrap custom email content in basic HTML template
   */
  wrapCustomContent(content) {
    // Convert line breaks to <br> tags
    const formattedContent = content.replace(/\n/g, '<br>');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
        </style>
    </head>
    <body>
        ${formattedContent}
    </body>
    </html>`;
  }

  /**
   * Generate HTML for availability request email (Stage 1)
   */
  generateAvailabilityRequestHTML(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 600px;
              margin: 0 auto;
            }
            .container { 
              background: #ffffff;
              padding: 32px;
            }
            .header { 
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 24px; 
              border-radius: 12px; 
              margin-bottom: 24px;
              text-align: center;
            }
            .content-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
            }
            .button {
              display: inline-block;
              background: #f97316;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 16px 0;
            }
            .footer { 
              margin-top: 32px; 
              padding-top: 24px; 
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🎯 Interview Opportunity</h2>
                <p style="margin: 0; opacity: 0.95; font-size: 18px;">${data.position}</p>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Dear <strong>${data.candidateName}</strong>,</p>
            
            <p style="color: #6b7280;">
                We are pleased to inform you that we would like to invite you for an interview 
                for the <strong>${data.position}</strong> position at our company.
            </p>
            
            <div class="content-box">
                <h3 style="margin: 0 0 12px 0; color: #111827;">📋 Next Steps</h3>
                <ol style="color: #6b7280; margin: 8px 0; padding-left: 20px;">
                    <li style="margin-bottom: 12px;">
                        <strong>Fill out the pre-interview form</strong><br>
                        Please provide some additional information about yourself
                    </li>
                    <li style="margin-bottom: 12px;">
                        <strong>Share your availability</strong><br>
                        Reply to this email with your available time slots for the interview
                    </li>
                </ol>
            </div>

            ${data.googleFormLink ? `
            <div style="text-align: center; margin: 32px 0;">
                <a href="${data.googleFormLink}" class="button">
                    📝 Complete Pre-Interview Form
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 12px;">
                    Form Link: ${data.googleFormLink}
                </p>
            </div>
            ` : ''}
            
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #1e40af;">💡 What to Expect</h4>
                <ul style="margin: 8px 0; padding-left: 20px; color: #1e3a8a;">
                    <li>The interview will last approximately 60 minutes</li>
                    <li>We'll discuss your experience and qualifications</li>
                    <li>You'll have the opportunity to learn more about the role</li>
                    <li>Feel free to ask any questions you may have</li>
                </ul>
            </div>
            
            <div class="footer">
                <p><strong>Please reply to this email with your availability within the next 3 business days.</strong></p>
                <p>We look forward to meeting you and learning more about your qualifications!</p>
                <br>
                <p style="margin: 0;">
                    Best regards,<br>
                    <strong>HR Team</strong><br>
                    Nexus AI Platform
                </p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate HTML for interview confirmation email (Stage 2)
   */
  generateInterviewConfirmationHTML(data) {
    const platformIcons = {
      'teams': '👥',
      'meet': '📹',
      'zoom': '🎥'
    };
    const icon = platformIcons[data.platform?.toLowerCase()] || '📹';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 600px;
              margin: 0 auto;
            }
            .container { 
              background: #ffffff;
              padding: 32px;
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 24px; 
              border-radius: 12px; 
              margin-bottom: 24px;
              text-align: center;
            }
            .details { 
              background: #f9fafb; 
              border: 1px solid #e5e7eb; 
              padding: 24px; 
              border-radius: 12px;
              margin-bottom: 24px;
            }
            .detail-item {
              display: flex;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-item:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
              min-width: 140px;
            }
            .detail-value {
              color: #6b7280;
              flex: 1;
            }
            .meeting-link {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 16px 0;
            }
            .calendar-buttons {
              display: flex;
              gap: 12px;
              margin: 20px 0;
              flex-wrap: wrap;
              justify-content: center;
            }
            .calendar-btn {
              display: inline-block;
              padding: 10px 20px;
              background: #f3f4f6;
              color: #374151;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 500;
              border: 1px solid #d1d5db;
            }
            .footer { 
              margin-top: 32px; 
              padding-top: 24px; 
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>✅ Interview Confirmed</h2>
                <p style="margin: 0; opacity: 0.95; font-size: 18px;">Your interview has been scheduled</p>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Dear <strong>${data.candidateName}</strong>,</p>
            
            <p style="color: #6b7280;">
                Thank you for your response. We're pleased to confirm your interview for the 
                <strong>${data.position}</strong> position has been scheduled.
            </p>
            
            <div class="details">
                <h3 style="margin: 0 0 16px 0; color: #111827;">📅 Interview Details</h3>
                <div class="detail-item">
                    <div class="detail-label">Date & Time:</div>
                    <div class="detail-value"><strong>${new Date(data.scheduledTime).toLocaleString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}</strong></div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Duration:</div>
                    <div class="detail-value">${data.duration} minutes</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Interview Type:</div>
                    <div class="detail-value">${data.interviewType}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Platform:</div>
                    <div class="detail-value">${icon} ${data.platform}</div>
                </div>
            </div>
            
            ${data.meetingLink ? `
            <div style="text-align: center; margin: 24px 0;">
                <a href="${data.meetingLink}" class="meeting-link">
                    ${icon} Join Meeting
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                    Meeting Link: <a href="${data.meetingLink}" style="color: #3b82f6;">${data.meetingLink}</a>
                </p>
            </div>
            ` : ''}

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #065f46;">📆 Add to Calendar</h4>
                <p style="margin: 0 0 12px 0; color: #047857;">A calendar file has been attached to this email. Click to add this interview to your calendar:</p>
                <div class="calendar-buttons">
                    <span class="calendar-btn">📅 Google Calendar</span>
                    <span class="calendar-btn">📧 Outlook</span>
                    <span class="calendar-btn">🍎 Apple Calendar</span>
                </div>
                <p style="margin: 12px 0 0 0; color: #047857; font-size: 14px;">Simply open the attached .ics file with your preferred calendar application.</p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #92400e;">📝 Preparation Tips</h4>
                <ul style="margin: 8px 0; padding-left: 20px; color: #78350f;">
                    <li>Review the job description and your application</li>
                    <li>Prepare examples of your relevant experience</li>
                    <li>Test your internet connection and ${data.platform} setup</li>
                    <li>Join the meeting 5 minutes early</li>
                    <li>Prepare questions about the role and company</li>
                </ul>
            </div>
            
            <div class="footer">
                <p><strong>Please confirm your attendance by replying to this email.</strong></p>
                <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
                <p style="margin-top: 16px;">We look forward to meeting you!</p>
                <br>
                <p style="margin: 0;">
                    Best regards,<br>
                    <strong>HR Team</strong><br>
                    Nexus AI Platform
                </p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Send email via Microsoft Graph API
   */
  async sendEmail(userId, emailData) {
    try {
      const accessToken = await this.getUserAccessToken(userId);

      const message = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: 'HTML',
            content: emailData.htmlBody
          },
          toRecipients: emailData.to.map(email => ({
            emailAddress: {
              address: email
            }
          })),
          ccRecipients: emailData.cc ? emailData.cc.map(email => ({
            emailAddress: {
              address: email
            }
          })) : [],
          bccRecipients: emailData.bcc ? emailData.bcc.map(email => ({
            emailAddress: {
              address: email
            }
          })) : [],
          attachments: emailData.attachments || []
        },
        saveToSentItems: true
      };

      const response = await axios.post(
        `${this.graphApiUrl}/me/sendMail`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.headers['request-id'],
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error.response?.data || error.message);
      throw new Error(`Failed to send email: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = OutlookEmailService;
