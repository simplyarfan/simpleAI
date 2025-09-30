/**
 * Email Integration Service
 * Handles Outlook OAuth for sending emails and generates .ics calendar files
 */

class EmailService {
  constructor() {
    this.outlookAuth = null;
    this.connectedEmail = {};
    this.currentUserId = null;
    
    // Email connections should be per-user, not global
    // We'll store them with user ID as key
    if (typeof window !== 'undefined') {
      this.loadUserEmailConnection();
    }
  }

  loadUserEmailConnection() {
    try {
      // Get current user from cookies
      const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        this.currentUserId = userData.id;
        const storageKey = `connectedEmail_${this.currentUserId}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          this.connectedEmail = JSON.parse(stored);
          console.log('✅ Loaded email connection for user:', this.currentUserId);
        }
      }
    } catch (e) {
      console.error('Failed to load user email connection:', e);
      this.connectedEmail = {};
    }
  }


  // Outlook Integration for Sending Emails
  async connectOutlook() {
    try {
      // Check if client ID is configured
      if (!process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID || process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID === 'your-outlook-client-id') {
        return {
          success: false,
          error: 'Outlook OAuth is not configured yet. Please contact your administrator to set up NEXT_PUBLIC_OUTLOOK_CLIENT_ID.'
        };
      }

      // Load Microsoft Graph SDK
      if (!window.msal) {
        await this.loadMSAL();
      }

      // Use tenant-specific endpoint for single-tenant apps
      // If you get "multi-tenant" error, you need to either:
      // 1. Change app to multi-tenant in Azure Portal, OR
      // 2. Use your tenant ID: 'https://login.microsoftonline.com/{your-tenant-id}'
      const msalConfig = {
        auth: {
          clientId: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID,
          authority: 'https://login.microsoftonline.com/organizations',
          redirectUri: window.location.origin
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false
        }
      };

      const msalInstance = new window.msal.PublicClientApplication(msalConfig);
      await msalInstance.initialize();
      
      const loginRequest = {
        scopes: ['https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/User.Read'],
        prompt: 'select_account',
        forceRefresh: false
      };

      console.log('🔐 Starting Outlook OAuth...');
      const response = await msalInstance.loginPopup(loginRequest);
      
      this.outlookAuth = response;
      this.connectedEmail.outlook = {
        connected: true,
        email: response.account.username,
        name: response.account.name,
        accessToken: response.accessToken,
        connectedAt: new Date().toISOString()
      };
      
      this.saveConnectedEmail();
      return { success: true, provider: 'outlook', user: this.connectedEmail.outlook };
    } catch (error) {
      console.error('Gmail connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send Email via Microsoft Graph API
  async sendEmail(to, subject, body, attachments = []) {
    try {
      if (!this.connectedEmail.outlook?.connected) {
        throw new Error('Outlook not connected. Please connect your Outlook account first.');
      }

      // Create email message for Microsoft Graph
      const emailMessage = {
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: body
          },
          toRecipients: [
            {
              emailAddress: {
                address: to
              }
            }
          ],
          attachments: attachments.map(attachment => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: attachment.filename,
            contentType: attachment.mimeType,
            contentBytes: attachment.data
          }))
        }
      };

      // Send email via Microsoft Graph
      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.connectedEmail.outlook.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailMessage)
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      return { success: true, messageId: 'sent' };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  // Create email message in RFC 2822 format
  createEmailMessage(to, subject, body, attachments = []) {
    const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9);
    
    let email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      body,
      ''
    ];

    // Add attachments
    attachments.forEach(attachment => {
      email.push(`--${boundary}`);
      email.push(`Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`);
      email.push('Content-Transfer-Encoding: base64');
      email.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
      email.push('');
      email.push(attachment.data);
      email.push('');
    });

    email.push(`--${boundary}--`);

    return btoa(email.join('\n')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Generate .ics calendar file
  generateICSFile(eventData) {
    const {
      title,
      startDate,
      endDate,
      location,
      description,
      candidateEmail,
      organizerEmail = this.connectedEmail.gmail?.email || 'noreply@example.com'
    } = eventData;

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatDate = (date) => {
      return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Interview Coordinator//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@interviewcoordinator.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      `ORGANIZER;CN=${organizerEmail}:mailto:${organizerEmail}`,
      `ATTENDEE;CN=${candidateEmail}:mailto:${candidateEmail}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Interview Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return {
      content: icsContent,
      filename: `interview-${title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`,
      mimeType: 'text/calendar'
    };
  }

  // Download .ics file
  downloadICSFile(eventData) {
    const icsFile = this.generateICSFile(eventData);
    const blob = new Blob([icsFile.content], { type: icsFile.mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = icsFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return icsFile;
  }

  // Disconnect Email
  disconnectEmail(provider = 'gmail') {
    if (this.connectedEmail[provider]) {
      delete this.connectedEmail[provider];
      this.saveConnectedEmail();
    }
  }

  // Get Connected Email (per-user)
  getConnectedEmail() {
    // Always refresh from localStorage to ensure we have latest data
    if (typeof window !== 'undefined') {
      this.loadUserEmailConnection();
    }
    return this.connectedEmail;
  }

  // Check if email is connected
  hasConnectedEmail() {
    return this.connectedEmail.outlook?.connected || false;
  }

  // Save to localStorage (per-user)
  saveConnectedEmail() {
    if (typeof window !== 'undefined') {
      const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          const userId = userData.id;
          const storageKey = `connectedEmail_${userId}`;
          localStorage.setItem(storageKey, JSON.stringify(this.connectedEmail));
        } catch (e) {
          console.error('Failed to save user email connection:', e);
        }
      }
    }
  }

  // Load Microsoft MSAL
  async loadMSAL() {
    return new Promise((resolve, reject) => {
      if (window.msal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.30.0/js/msal-browser.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('✅ MSAL loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load MSAL:', error);
        reject(new Error('Failed to load Microsoft MSAL'));
      };
      document.head.appendChild(script);
    });
  }
}

// Create and export singleton instance
const emailService = new EmailService();
export default emailService;
