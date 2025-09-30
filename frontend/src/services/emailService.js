/**
 * Email Integration Service
 * Handles Gmail OAuth for sending emails and generates .ics calendar files
 */

class EmailService {
  constructor() {
    this.gmailAuth = null;
    this.connectedEmail = {};
    
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      this.connectedEmail = JSON.parse(localStorage.getItem('connectedEmail') || '{}');
    }
  }

  // Gmail Integration for Sending Emails
  async connectGmail() {
    try {
      // Check if client ID is configured
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID === 'your-google-client-id') {
        return {
          success: false,
          error: 'Gmail OAuth is not configured yet. Please contact your administrator to set up NEXT_PUBLIC_GOOGLE_CLIENT_ID.'
        };
      }

      // Load Google API
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      await new Promise((resolve) => {
        window.gapi.load('auth2', resolve);
      });

      const authInstance = window.gapi.auth2.init({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email'
      });

      const user = await authInstance.signIn();
      const authResponse = user.getAuthResponse();
      
      this.gmailAuth = authResponse;
      this.connectedEmail.gmail = {
        connected: true,
        email: user.getBasicProfile().getEmail(),
        name: user.getBasicProfile().getName(),
        accessToken: authResponse.access_token,
        connectedAt: new Date().toISOString()
      };
      
      this.saveConnectedEmail();
      return { success: true, provider: 'gmail', user: this.connectedEmail.gmail };
    } catch (error) {
      console.error('Gmail connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send Email via Gmail API
  async sendEmail(to, subject, body, attachments = []) {
    try {
      if (!this.connectedEmail.gmail?.connected) {
        throw new Error('Gmail not connected. Please connect your Gmail account first.');
      }

      // Load Gmail API
      await new Promise((resolve) => {
        window.gapi.load('client', resolve);
      });

      await window.gapi.client.init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
        scope: 'https://www.googleapis.com/auth/gmail.send'
      });

      // Create email message
      const email = this.createEmailMessage(to, subject, body, attachments);
      
      const response = await window.gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: email
        }
      });

      return { success: true, messageId: response.result.id };
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

  // Get Connected Email
  getConnectedEmail() {
    // Refresh from localStorage if on client side
    if (typeof window !== 'undefined') {
      this.connectedEmail = JSON.parse(localStorage.getItem('connectedEmail') || '{}');
    }
    return this.connectedEmail;
  }

  // Check if email is connected
  hasConnectedEmail() {
    return this.connectedEmail.gmail?.connected || false;
  }

  // Save to localStorage
  saveConnectedEmail() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('connectedEmail', JSON.stringify(this.connectedEmail));
    }
  }

  // Load Google API
  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }
}

// Create and export singleton instance
const emailService = new EmailService();
export default emailService;
