/**
 * EMAIL SERVICE - Microsoft Outlook Integration
 * Handles sending emails via Microsoft Graph API with OAuth
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
        'SELECT outlook_access_token, outlook_refresh_token, outlook_token_expires_at FROM users WHERE id = ?',
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
        'UPDATE users SET outlook_access_token = ?, outlook_refresh_token = ?, outlook_token_expires_at = ? WHERE id = ?',
        [access_token, refresh_token || refreshToken, expiresAt.toISOString(), userId]
      );

      return access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
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

      console.log('✅ Email sent successfully via Outlook');
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

  /**
   * Send interview invitation with ICS attachment
   */
  async sendInterviewInvitation(userId, recipientEmail, interviewData, icsContent) {
    const htmlBody = this.generateInterviewInvitationHTML(interviewData);

    // Convert ICS content to base64 for attachment
    const icsBase64 = Buffer.from(icsContent).toString('base64');

    const emailData = {
      to: [recipientEmail],
      cc: interviewData.panelEmails || [],
      subject: `Interview Invitation - ${interviewData.jobTitle}`,
      htmlBody: htmlBody,
      attachments: [
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: 'interview.ics',
          contentType: 'text/calendar',
          contentBytes: icsBase64
        }
      ]
    };

    return await this.sendEmail(userId, emailData);
  }

  /**
   * Generate HTML email template for interview invitation
   */
  generateInterviewInvitationHTML(interviewData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
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
            }
            .header h2 {
              margin: 0 0 8px 0;
              font-size: 24px;
            }
            .details { 
              background: #f9fafb; 
              border: 1px solid #e5e7eb; 
              padding: 24px; 
              border-radius: 12px;
              margin-bottom: 24px;
            }
            .details h3 {
              margin: 0 0 16px 0;
              color: #111827;
              font-size: 18px;
            }
            .detail-item {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-item:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
              min-width: 120px;
            }
            .detail-value {
              color: #6b7280;
            }
            .meeting-link {
              display: inline-block;
              background: #f97316;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 16px 0;
            }
            .panel-section {
              margin-top: 24px;
            }
            .panel-member {
              background: white;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 8px;
              border: 1px solid #e5e7eb;
            }
            .footer { 
              margin-top: 32px; 
              padding-top: 24px; 
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .calendar-buttons {
              display: flex;
              gap: 12px;
              margin: 20px 0;
              flex-wrap: wrap;
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
          </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🎯 Interview Invitation</h2>
                <p style="margin: 0; opacity: 0.95;">You've been invited for an interview</p>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Dear <strong>${interviewData.candidateName}</strong>,</p>
            
            <p style="color: #6b7280;">
                We are pleased to invite you for an interview for the <strong>${interviewData.jobTitle}</strong> position. 
                We look forward to discussing your qualifications and learning more about you.
            </p>
            
            <div class="details">
                <h3>📅 Interview Details</h3>
                <div class="detail-item">
                    <div class="detail-label">Date & Time:</div>
                    <div class="detail-value">${new Date(interviewData.scheduledTime).toLocaleString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Duration:</div>
                    <div class="detail-value">${interviewData.duration} minutes</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Interview Type:</div>
                    <div class="detail-value">${interviewData.interviewType}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Location:</div>
                    <div class="detail-value">${interviewData.location}</div>
                </div>
            </div>
            
            ${interviewData.meetingLink ? `
            <div style="text-align: center; margin: 24px 0;">
                <a href="${interviewData.meetingLink}" class="meeting-link">
                    📹 Join Meeting
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                    Meeting Link: ${interviewData.meetingLink}
                </p>
            </div>
            ` : ''}

            ${interviewData.panelMembers && interviewData.panelMembers.length > 0 ? `
            <div class="panel-section">
                <h3 style="color: #111827; margin-bottom: 12px;">👥 Interview Panel</h3>
                ${interviewData.panelMembers.map(member => `
                    <div class="panel-member">
                        <strong>${member.name}</strong>
                        ${member.role ? `<span style="color: #6b7280;"> - ${member.role}</span>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #92400e;">📝 Preparation Tips</h4>
                <ul style="margin: 8px 0; padding-left: 20px; color: #78350f;">
                    <li>Review the job description and your application</li>
                    <li>Prepare examples of your relevant experience</li>
                    <li>Test your internet connection and video setup</li>
                    <li>Join the meeting 5 minutes early</li>
                    <li>Prepare questions to ask about the role and company</li>
                </ul>
            </div>

            ${interviewData.calendlyLink ? `
            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #1e40af;">
                    <strong>Need to reschedule?</strong><br>
                    Use this link: <a href="${interviewData.calendlyLink}" style="color: #2563eb;">${interviewData.calendlyLink}</a>
                </p>
            </div>
            ` : ''}

            ${interviewData.googleFormLink ? `
            <div style="background: #f3e8ff; border-left: 4px solid #9333ea; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #6b21a8;">
                    <strong>Pre-interview Form:</strong><br>
                    Please fill out this form before the interview: <a href="${interviewData.googleFormLink}" style="color: #7c3aed;">${interviewData.googleFormLink}</a>
                </p>
            </div>
            ` : ''}
            
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
   * Send interview reminder
   */
  async sendInterviewReminder(userId, recipientEmail, interviewData, reminderType) {
    const timeUntil = this.getTimeUntilInterview(interviewData.scheduledTime, reminderType);
    
    const htmlBody = `
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
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
              color: white;
              padding: 24px; 
              border-radius: 12px; 
              margin-bottom: 24px;
              text-align: center;
            }
            .reminder-box {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin: 24px 0;
            }
            .meeting-link {
              display: inline-block;
              background: #f97316;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 16px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>⏰ Interview Reminder</h2>
                <p style="margin: 0; font-size: 18px;">${timeUntil}</p>
            </div>
            
            <p>Hi <strong>${interviewData.candidateName}</strong>,</p>
            
            <div class="reminder-box">
                <h3 style="margin: 0 0 8px 0; color: #92400e;">Your interview is coming up!</h3>
                <p style="margin: 0; color: #78350f; font-size: 18px;">
                    <strong>${new Date(interviewData.scheduledTime).toLocaleString()}</strong>
                </p>
            </div>
            
            <p><strong>Interview Details:</strong></p>
            <ul>
                <li><strong>Position:</strong> ${interviewData.jobTitle}</li>
                <li><strong>Type:</strong> ${interviewData.interviewType}</li>
                <li><strong>Duration:</strong> ${interviewData.duration} minutes</li>
                <li><strong>Location:</strong> ${interviewData.location}</li>
            </ul>

            ${interviewData.meetingLink ? `
            <div style="text-align: center; margin: 24px 0;">
                <a href="${interviewData.meetingLink}" class="meeting-link">
                    📹 Join Meeting
                </a>
            </div>
            ` : ''}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                Good luck with your interview!<br>
                <strong>HR Team</strong>
            </p>
        </div>
    </body>
    </html>`;

    const emailData = {
      to: [recipientEmail],
      subject: `⏰ Reminder: Interview ${timeUntil} - ${interviewData.jobTitle}`,
      htmlBody: htmlBody
    };

    return await this.sendEmail(userId, emailData);
  }

  /**
   * Get time until interview for reminder messages
   */
  getTimeUntilInterview(scheduledTime, reminderType) {
    switch(reminderType) {
      case '24h_before':
        return 'in 24 hours';
      case '2h_before':
        return 'in 2 hours';
      case '15m_before':
        return 'in 15 minutes';
      default:
        return 'soon';
    }
  }
}

module.exports = OutlookEmailService;
