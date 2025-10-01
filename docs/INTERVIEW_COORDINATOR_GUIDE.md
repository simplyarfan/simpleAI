# Interview Coordinator - Complete Guide

## Overview

The Interview Coordinator is an AI-powered system that automates interview scheduling, email invitations, calendar management, and interview question generation.

---

## Features

### ✅ Core Features
- **AI-Powered Question Generation** - Automatically generates tailored interview questions
- **Email Invitations** - Send professional invitations via Microsoft Outlook
- **Calendar Integration** - Download ICS files for Google, Outlook, and Apple Calendar
- **Automated Reminders** - Schedule reminders at 24h, 2h, and 15min before interviews
- **Panel Management** - Add multiple interviewers to the panel
- **Status Tracking** - Track interview status (scheduled, invited, completed, cancelled)

### 📧 Email Features
- Professional HTML email templates
- ICS calendar file attachments
- Meeting links and preparation tips
- Responsive design for all devices
- Automatic reminder emails

### 📅 Calendar Features
- Generate ICS files compatible with:
  - Google Calendar (web and mobile)
  - Microsoft Outlook (desktop and web)
  - Apple Calendar (macOS and iOS)
- Automatic reminders embedded in calendar events
- Panel members added as attendees

---

## Quick Start

1. Set environment variables
2. Run database migration
3. Connect Outlook account
4. Schedule your first interview!

See detailed setup instructions below.

---

## Detailed Setup

### 1. Environment Variables

Add to `.env`:

```bash
OPENAI_API_KEY=sk-...
OUTLOOK_CLIENT_ID=your-client-id
OUTLOOK_CLIENT_SECRET=your-client-secret
```

### 2. Database Migration

```bash
sqlite3 database.db < backend/migrations/migrate_interview_coordinator.sql
```

### 3. Microsoft Azure OAuth Setup

See [Azure Setup Guide](./AZURE_OAUTH_SETUP.md) for detailed instructions.

---

## Usage

### Schedule an Interview

1. Click **"Schedule Interview"**
2. Fill in candidate details
3. Set interview time and type
4. Add panel members (optional)
5. Enable **"Send email invitation"**
6. Click **"Schedule Interview"**

### Download Calendar Files

1. Find your interview in the list
2. Click the **download icon** (⬇️)
3. Choose your calendar:
   - Google Calendar
   - Outlook Calendar
   - Apple Calendar
4. Import the downloaded file

---

## API Reference

See full API documentation in the main README.

Key endpoints:
- `GET /api/interview-coordinator/interviews` - List interviews
- `POST /api/interview-coordinator/schedule` - Schedule interview
- `GET /api/interview-coordinator/calendar/:id/ics` - Download calendar

---

## Troubleshooting

### Emails Not Sending
- Verify Outlook OAuth connection
- Check token expiration
- Review server logs

### Calendar Not Working
- Ensure interview has scheduled_time
- Verify ICS file format
- Test with different calendar apps

### Questions Not Generating
- Check OPENAI_API_KEY
- Verify API credits
- System falls back to default questions

---

## Best Practices

- Schedule interviews 24h+ in advance
- Include meeting links for virtual interviews
- Add panel members for automatic invites
- Test with a dummy interview first
- Review generated questions before sending

---

For complete documentation, see `INTERVIEW_COORDINATOR_FIXES.md`
