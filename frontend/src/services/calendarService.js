/**
 * Calendar Integration Service
 * Handles Google Calendar and Outlook Calendar OAuth and event creation
 */

class CalendarService {
  constructor() {
    this.googleAuth = null;
    this.outlookAuth = null;
    this.connectedCalendars = JSON.parse(localStorage.getItem('connectedCalendars') || '{}');
  }

  // Google Calendar Integration
  async connectGoogleCalendar() {
    try {
      // Load Google API
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      await new Promise((resolve) => {
        window.gapi.load('auth2', resolve);
      });

      const authInstance = window.gapi.auth2.init({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
        scope: 'https://www.googleapis.com/auth/calendar'
      });

      const user = await authInstance.signIn();
      const authResponse = user.getAuthResponse();
      
      this.googleAuth = authResponse;
      this.connectedCalendars.google = {
        connected: true,
        email: user.getBasicProfile().getEmail(),
        name: user.getBasicProfile().getName(),
        accessToken: authResponse.access_token,
        connectedAt: new Date().toISOString()
      };

      this.saveConnectedCalendars();
      return { success: true, provider: 'google', user: this.connectedCalendars.google };
    } catch (error) {
      console.error('Google Calendar connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Microsoft Outlook Integration
  async connectOutlookCalendar() {
    try {
      // Load Microsoft Graph API
      if (!window.Msal) {
        await this.loadMicrosoftAPI();
      }

      const msalConfig = {
        auth: {
          clientId: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID || 'your-outlook-client-id',
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin
        }
      };

      const msalInstance = new window.Msal.PublicClientApplication(msalConfig);
      
      const loginRequest = {
        scopes: ['https://graph.microsoft.com/calendars.readwrite']
      };

      const response = await msalInstance.loginPopup(loginRequest);
      
      this.outlookAuth = response;
      this.connectedCalendars.outlook = {
        connected: true,
        email: response.account.username,
        name: response.account.name,
        accessToken: response.accessToken,
        connectedAt: new Date().toISOString()
      };

      this.saveConnectedCalendars();
      return { success: true, provider: 'outlook', user: this.connectedCalendars.outlook };
    } catch (error) {
      console.error('Outlook Calendar connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create Google Calendar Event
  async createGoogleEvent(eventDetails) {
    if (!this.connectedCalendars.google?.connected) {
      throw new Error('Google Calendar not connected');
    }

    const event = {
      summary: eventDetails.title,
      description: eventDetails.description || '',
      start: {
        dateTime: eventDetails.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: eventDetails.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: eventDetails.attendees || [],
      conferenceData: eventDetails.meetingLink ? {
        createRequest: {
          requestId: 'interview-' + Date.now(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      } : undefined
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.connectedCalendars.google.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error('Failed to create Google Calendar event');
    }

    return await response.json();
  }

  // Create Outlook Calendar Event
  async createOutlookEvent(eventDetails) {
    if (!this.connectedCalendars.outlook?.connected) {
      throw new Error('Outlook Calendar not connected');
    }

    const event = {
      subject: eventDetails.title,
      body: {
        contentType: 'HTML',
        content: eventDetails.description || ''
      },
      start: {
        dateTime: eventDetails.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: eventDetails.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: eventDetails.attendees?.map(email => ({
        emailAddress: { address: email, name: email }
      })) || [],
      isOnlineMeeting: !!eventDetails.meetingLink,
      onlineMeetingProvider: eventDetails.meetingLink ? 'teamsForBusiness' : undefined
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.connectedCalendars.outlook.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error('Failed to create Outlook Calendar event');
    }

    return await response.json();
  }

  // Disconnect Calendar
  disconnectCalendar(provider) {
    if (this.connectedCalendars[provider]) {
      delete this.connectedCalendars[provider];
      this.saveConnectedCalendars();
    }
  }

  // Get Connected Calendars
  getConnectedCalendars() {
    return this.connectedCalendars;
  }

  // Check if any calendar is connected
  hasConnectedCalendar() {
    return Object.keys(this.connectedCalendars).some(key => this.connectedCalendars[key]?.connected);
  }

  // Save to localStorage
  saveConnectedCalendars() {
    localStorage.setItem('connectedCalendars', JSON.stringify(this.connectedCalendars));
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

  // Load Microsoft API
  async loadMicrosoftAPI() {
    return new Promise((resolve, reject) => {
      if (window.Msal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.14.2/js/msal-browser.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Microsoft API'));
      document.head.appendChild(script);
    });
  }
}

export default new CalendarService();
