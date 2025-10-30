/**
 * GOOGLE CALENDAR SERVICE
 * Creates actual Google Meet links via Google Calendar API
 * Requires Google OAuth integration
 */

const axios = require('axios');
const database = require('../models/database');

class GoogleCalendarService {
  constructor() {
    this.calendarApiUrl = 'https://www.googleapis.com/calendar/v3';
  }

  /**
   * Get user's Google Calendar access token from database
   */
  async getUserAccessToken(userId) {
    try {
      await database.connect();
      const user = await database.get(
        'SELECT google_access_token, google_refresh_token, google_token_expires_at FROM users WHERE id = $1',
        [userId]
      );

      if (!user || !user.google_access_token) {
        throw new Error('User has not connected their Google Calendar account');
      }

      // Check if token is expired
      const expiresAt = new Date(user.google_token_expires_at);
      const now = new Date();

      if (expiresAt <= now) {
        // Token expired, need to refresh
        return await this.refreshAccessToken(userId, user.google_refresh_token);
      }

      return user.google_access_token;
    } catch (error) {
      console.error('Error getting Google access token:', error);
      throw error;
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(userId, refreshToken) {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      const { access_token, refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Update tokens in database
      await database.run(
        'UPDATE users SET google_access_token = $1, google_refresh_token = $2, google_token_expires_at = $3 WHERE id = $4',
        [access_token, refresh_token || refreshToken, expiresAt.toISOString(), userId]
      );

      return access_token;
    } catch (error) {
      console.error('Error refreshing Google token:', error);
      throw new Error('Failed to refresh Google access token');
    }
  }

  /**
   * Create a Google Calendar event with Google Meet link
   */
  async createCalendarEventWithMeet(userId, eventData) {
    try {
      const accessToken = await this.getUserAccessToken(userId);

      // Format dates for Google Calendar API
      const startDate = new Date(eventData.scheduledTime);
      const endDate = new Date(startDate.getTime() + (eventData.duration || 60) * 60000);

      const calendarEvent = {
        summary: `Interview - ${eventData.candidateName} - ${eventData.position}`,
        description: this.generateEventDescription(eventData),
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC'
        },
        attendees: [
          { email: eventData.candidateEmail }
        ],
        conferenceData: {
          createRequest: {
            requestId: `interview-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
            { method: 'popup', minutes: 15 }
          ]
        }
      };

      const response = await axios.post(
        `${this.calendarApiUrl}/calendars/primary/events?conferenceDataVersion=1`,
        calendarEvent,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract Google Meet link from response
      const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri;

      return {
        success: true,
        eventId: response.data.id,
        meetingLink: meetLink,
        htmlLink: response.data.htmlLink,
        message: 'Google Calendar event created with Meet link'
      };
    } catch (error) {
      console.error('❌ Failed to create Google Calendar event:', error.response?.data || error.message);
      throw new Error(`Failed to create Google Meet: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate event description
   */
  generateEventDescription(eventData) {
    return `Interview Details:\n\n` +
      `Position: ${eventData.position}\n` +
      `Type: ${eventData.interviewType || 'General'}\n` +
      `Duration: ${eventData.duration || 60} minutes\n` +
      `Candidate: ${eventData.candidateName}\n` +
      `Email: ${eventData.candidateEmail}\n\n` +
      (eventData.notes ? `Notes: ${eventData.notes}\n\n` : '') +
      `This meeting includes a Google Meet video conference.\n` +
      `If you need to reschedule, please contact the interviewer.`;
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(userId, eventId) {
    try {
      const accessToken = await this.getUserAccessToken(userId);

      await axios.delete(
        `${this.calendarApiUrl}/calendars/primary/events/${eventId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return {
        success: true,
        message: 'Calendar event deleted successfully'
      };
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(userId, eventId, eventData) {
    try {
      const accessToken = await this.getUserAccessToken(userId);

      const startDate = new Date(eventData.scheduledTime);
      const endDate = new Date(startDate.getTime() + (eventData.duration || 60) * 60000);

      const calendarEvent = {
        summary: `Interview - ${eventData.candidateName} - ${eventData.position}`,
        description: this.generateEventDescription(eventData),
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC'
        }
      };

      const response = await axios.patch(
        `${this.calendarApiUrl}/calendars/primary/events/${eventId}`,
        calendarEvent,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        eventId: response.data.id,
        message: 'Calendar event updated successfully'
      };
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }
}

module.exports = GoogleCalendarService;
