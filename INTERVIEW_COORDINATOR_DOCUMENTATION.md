# INTERVIEW COORDINATOR (HR-02) - COMPLETE DOCUMENTATION

## 📋 System Overview

The Interview Coordinator is a **two-stage interview workflow system** that manages the entire interview lifecycle from initial availability requests to final scheduling with calendar integration.

### Key Features
- ✅ Two-stage workflow (Availability Request → Schedule Interview)
- ✅ Outlook/Microsoft Graph API integration for emails
- ✅ Automatic `.ics` calendar file generation
- ✅ AI-powered interview question generation
- ✅ Auto-generated meeting links (Google Meet, Teams, Zoom)
- ✅ Email template customization
- ✅ Interview status tracking
- ✅ Calendar export for Google/Outlook/Apple

---

## 🔄 **WORKFLOW PROCESS**

### **Stage 1: Request Availability**

**Purpose:** Send an initial email to candidates requesting their availability before scheduling.

#### Frontend Flow:
1. User clicks "Request Availability" button
2. Modal opens with form fields:
   - Candidate Name *(required)*
   - Candidate Email *(required)*
   - Position *(required)*
   - Google Form Link *(optional)*
   - Email Subject *(pre-filled, editable)*
   - Email Content *(pre-filled, editable)*
   - CC Emails *(optional)*
   - BCC Emails *(optional)*

3. Default email template is auto-loaded:
```
Subject: Interview Opportunity - [Position]

Dear [Candidate Name],

We are pleased to inform you that we have shortlisted you for an interview for the [Position] position.

[Google Form Link if provided]

Please let us know your availability.

Best regards,
[Company Name]
```

#### Backend Flow (`POST /api/interview-coordinator/request-availability`):
1. **Validate** required fields (candidateName, candidateEmail, position)
2. **Check** user has connected Outlook account
3. **Retrieve** user's Outlook access token from database
4. **Send email** via Microsoft Graph API (`/me/sendMail`)
5. **Only if email succeeds**, create interview record in database:
   - Status: `awaiting_response`
   - Generate unique interview ID
   - Store candidate info
6. Return success response

**Key Logic:**
- Email is sent FIRST before database record creation
- If email fails, NO interview record is created (fail-fast approach)
- Interview ID is generated using timestamp + random string

---

### **Stage 2: Schedule Interview**

**Purpose:** After candidate confirms availability, schedule the actual interview with specific time/date.

#### Frontend Flow:
1. User clicks "Schedule Interview" on an existing interview
2. Modal opens with scheduling form:
   - Interview Type *(dropdown: technical, behavioral, HR, panel)*
   - Scheduled Time *(datetime picker)*
   - Duration *(default: 60 minutes)*
   - Platform *(dropdown: Google Meet, Teams, Zoom, In-Person)*
   - Notes *(optional)*

#### Backend Flow (`POST /api/interview-coordinator/schedule-interview`):
1. **Validate** required fields (interviewId, scheduledTime, platform)
2. **Auto-generate meeting link** based on platform:
   ```javascript
   Google Meet: https://meet.google.com/[meetingId]
   Teams: https://teams.microsoft.com/l/meetup-join/[meetingId]
   Zoom: https://zoom.us/j/[meetingId]
   ```
3. **Verify** interview exists and belongs to current user
4. **Update** interview record:
   - Set scheduled_time, duration, platform, meeting_link
   - Change status from `awaiting_response` → `scheduled`
5. **Generate `.ics` file** using InterviewCoordinatorService
6. **Send confirmation email** with calendar attachment via Outlook API
7. Return success response

**Key Logic:**
- Meeting links are auto-generated (not real links, just placeholders)
- .ics file includes 15-minute reminder alarm
- Email includes calendar file as attachment

---

## 🗄️ **DATABASE SCHEMA**

### `interviews` Table
```sql
CREATE TABLE interviews (
  id VARCHAR(255) PRIMARY KEY,
  candidate_id VARCHAR(255),
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  interview_type VARCHAR(50),           -- technical, behavioral, HR, panel
  scheduled_time TIMESTAMP,
  duration INTEGER DEFAULT 60,
  platform VARCHAR(100),                -- Google Meet, Teams, Zoom, etc.
  meeting_link TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'awaiting_response',  -- awaiting_response, scheduled, completed, cancelled
  outcome VARCHAR(50),                  -- selected, rejected, null
  google_form_link TEXT,
  scheduled_by INTEGER REFERENCES users(id),
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status Lifecycle:**
```
awaiting_response → scheduled → completed
                             ↓
                         cancelled
```

**Outcome (after completed):**
- `selected` - Candidate hired
- `rejected` - Candidate not selected
- `null` - No decision yet

---

## 📧 **EMAIL INTEGRATION**

### Outlook/Microsoft Graph API

**Authentication Required:**
- User must connect Outlook account in Profile settings
- Access token stored in `users.outlook_access_token`
- Email sent from user's Outlook account (`users.outlook_email`)

### Email Types:

#### 1. **Availability Request Email**
- Sent in Stage 1
- Simple text email
- Includes Google Form link if provided
- Supports CC/BCC

#### 2. **Interview Confirmation Email**
- Sent in Stage 2
- Includes interview details
- Attaches `.ics` calendar file
- Includes meeting link

### Microsoft Graph API Endpoint:
```javascript
POST https://graph.microsoft.com/v1.0/me/sendMail
Authorization: Bearer [outlook_access_token]

{
  "message": {
    "subject": "...",
    "body": { "contentType": "Text", "content": "..." },
    "toRecipients": [{ "emailAddress": { "address": "..." } }],
    "ccRecipients": [...],
    "bccRecipients": [...],
    "attachments": [...]  // For .ics files
  }
}
```

---

## 📅 **CALENDAR FILE (.ics) GENERATION**

### Implementation Location:
- Service: `backend/services/interviewCoordinatorService.js`
- Method: `generateICSInvite(interviewData)`
- Routes: 
  - `GET /api/interview-coordinator/interview/:id/calendar` (download)
  - `GET /api/interview-coordinator/calendar/:id/ics` (download with type)

### ICS File Structure:
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nexus AI Platform//Interview Coordinator//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:interview_123@nexusai.com
DTSTART:20251230T140000Z
DTEND:20251230T150000Z
DTSTAMP:20251229T120000Z
SUMMARY:Interview - John Doe - Software Engineer
DESCRIPTION:Interview details...
LOCATION:Google Meet
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M                     ← 15-minute reminder
ACTION:DISPLAY
DESCRIPTION:Interview starts in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR
```

### Key Features:
- ✅ **RFC 5545 compliant** (standard calendar format)
- ✅ **15-minute reminder alarm** built-in
- ✅ **Works with all calendar apps** (Google, Outlook, Apple)
- ✅ **Includes meeting link** in description
- ✅ **Auto-calculates end time** based on duration

### Date Format Helper:
```javascript
const formatDate = (date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};
// Input: 2025-12-30T14:00:00.000Z
// Output: 20251230T140000Z
```

---

## 🎯 **AI-POWERED FEATURES**

### 1. **Interview Question Generation**
**Service Method:** `generateInterviewQuestions(jobDescription, candidateData, interviewType)`

**Generates:**
- Opening questions (2-3)
- Technical questions (3-5)
- Behavioral questions (3-5)
- Role-specific questions (3-5)
- Closing questions (2-3)
- Evaluation criteria

**Input:**
```javascript
{
  jobDescription: "Full JD text...",
  candidateData: {
    name: "John Doe",
    experience_years: 5,
    skills: ["Python", "AWS", "Docker"],
    education: "BS Computer Science",
    current_role: "Senior Developer"
  },
  interviewType: "technical"
}
```

**Output:**
```javascript
{
  "opening_questions": ["Tell me about yourself..."],
  "technical_questions": ["Describe your experience with..."],
  "behavioral_questions": ["Tell me about a time when..."],
  "role_specific_questions": ["How would you handle..."],
  "closing_questions": ["Do you have any questions?"],
  "evaluation_criteria": ["Technical competency", "Communication"]
}
```

**AI Model:** GPT-3.5-turbo (placeholder for Llama 3.1)
**Temperature:** 0.3 (focused, consistent)
**Max Tokens:** 1200

---

## 🔗 **API ENDPOINTS**

### **GET /interviews**
**Purpose:** Fetch all interviews for logged-in user
**Auth:** Required
**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": "interview_1234567890_abc123",
      "candidate_name": "John Doe",
      "candidate_email": "john@example.com",
      "job_title": "Software Engineer",
      "status": "scheduled",
      "scheduled_time": "2025-12-30T14:00:00Z",
      "platform": "Google Meet",
      "meeting_link": "https://meet.google.com/xyz-abc-def"
    }
  ]
}
```

### **GET /interview/:id**
**Purpose:** Get single interview details
**Auth:** Required
**Response:** Single interview object

### **POST /request-availability**
**Purpose:** Stage 1 - Send availability request email
**Auth:** Required
**Body:**
```javascript
{
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "position": "Software Engineer",
  "googleFormLink": "https://forms.google.com/...",  // optional
  "emailSubject": "Interview Opportunity - Software Engineer",
  "emailContent": "Dear John...",
  "ccEmails": ["hr@company.com"],      // optional
  "bccEmails": ["manager@company.com"]  // optional
}
```

### **POST /schedule-interview**
**Purpose:** Stage 2 - Schedule interview with specific time
**Auth:** Required
**Body:**
```javascript
{
  "interviewId": "interview_1234567890_abc123",
  "interviewType": "technical",
  "scheduledTime": "2025-12-30T14:00:00Z",
  "duration": 60,
  "platform": "Google Meet",
  "notes": "Please join 5 minutes early"
}
```

### **PUT /interview/:id/status**
**Purpose:** Update interview status/outcome
**Auth:** Required
**Body:**
```javascript
{
  "status": "completed",      // awaiting_response | scheduled | completed | cancelled
  "outcome": "selected",      // selected | rejected | null
  "notes": "Great interview"
}
```

### **GET /interview/:id/calendar**
**Purpose:** Download .ics calendar file
**Auth:** Required
**Response:** Binary .ics file download

### **DELETE /interview/:id**
**Purpose:** Delete/cancel interview
**Auth:** Required
**Response:** Success confirmation

---

## 🎨 **FRONTEND COMPONENTS**

### **Main Page:** `frontend/src/pages/interview-coordinator.js`
**Features:**
- Interview list with search/filter
- Status badges (awaiting, scheduled, completed, cancelled)
- Two action buttons per interview:
  - "Schedule Interview" (for awaiting_response status)
  - "View Details" / "Edit" (for scheduled status)
- Request Availability modal
- Schedule Interview modal

**URL Query Params (Integration with CV Intelligence):**
```
/interview-coordinator?action=request-availability&candidateName=John&candidateEmail=john@example.com&position=Engineer
```
- Auto-opens availability modal with pre-filled data

### **Schedule Page:** `frontend/src/pages/interview-coordinator/schedule.js`
**Features:**
- Standalone scheduling form
- Email preview before sending
- Calendar connection check
- Redirect to main page after success

---

## 🔧 **SERVICE CLASSES**

### **InterviewCoordinatorService** (`backend/services/interviewCoordinatorService.js`)
**Methods:**
- `generateInterviewQuestions()` - AI question generation
- `createInterviewSchedule()` - Create schedule object
- `generateICSInvite()` - Generate .ics calendar file
- `sendInterviewInvitation()` - Prepare email with attachment
- `scheduleReminders()` - Generate reminder schedule (24h, 2h, 15m)
- `checkConflicts()` - Mock calendar conflict detection
- `coordinateInterview()` - Main orchestration method

### **OutlookEmailService** (`backend/services/outlookEmailService.js`)
**Methods:**
- `sendInterviewConfirmation()` - Send confirmation email
- Direct Microsoft Graph API integration
- Token management

---

## 🔐 **SECURITY & PERMISSIONS**

### Authentication:
- All endpoints require JWT token (`authenticateToken` middleware)
- User ID extracted from token: `req.user.id`

### Ownership Validation:
- All GET/PUT/DELETE operations verify interview belongs to user:
```sql
WHERE id = $1 AND scheduled_by = $2
```

### Outlook Token:
- Stored encrypted in `users.outlook_access_token`
- Retrieved per-request for email sending
- User must re-authenticate if token expires

---

## 📊 **STATUS TRACKING**

### Interview Statuses:
| Status | Description | Actions Available |
|--------|-------------|-------------------|
| `awaiting_response` | Availability request sent, waiting for candidate | Schedule Interview |
| `scheduled` | Interview scheduled with date/time | Complete, Cancel, Reschedule |
| `completed` | Interview finished | Mark Outcome (Selected/Rejected) |
| `cancelled` | Interview cancelled | Delete |

### Outcome (Post-Interview):
| Outcome | Description |
|---------|-------------|
| `selected` | Candidate hired |
| `rejected` | Candidate not selected |
| `null` | No decision yet |

---

## 🚀 **INTEGRATION POINTS**

### **1. CV Intelligence → Interview Coordinator**
**From:** CV Intelligence candidate ranking page
**To:** Interview Coordinator availability request modal
**Data Passed:**
- `candidateName`
- `candidateEmail`
- `position`

**URL:** `/interview-coordinator?action=request-availability&candidateName=...&candidateEmail=...&position=...`

### **2. Profile Settings → Interview Coordinator**
**Dependency:** Outlook email connection
**Setup Location:** `/profile?tab=email`
**Required:** User must connect Outlook before sending emails

---

## 🐛 **ERROR HANDLING**

### Common Errors:

#### 1. **No Outlook Token**
```javascript
{
  "success": false,
  "message": "Please connect your Outlook account first to send emails"
}
```
**Solution:** Redirect user to `/profile?tab=email`

#### 2. **Email Send Failure**
```javascript
{
  "success": false,
  "message": "Failed to send email. Interview not created.",
  "error": "Token expired" // or other Graph API error
}
```
**Solution:** No interview record created (fail-fast)

#### 3. **Interview Not Found**
```javascript
{
  "success": false,
  "message": "Interview not found"
}
```
**Cause:** Invalid ID or wrong user

---

## 📈 **FUTURE ENHANCEMENTS**

### Planned Features:
1. **Real calendar conflict detection** (Google Calendar API integration)
2. **Automated reminder emails** (24h, 2h, 15m before interview)
3. **Interview feedback forms** (post-interview surveys)
4. **Panel coordination** (multi-interviewer scheduling)
5. **Candidate self-scheduling** (Calendly-like interface)
6. **Interview recording integration** (Zoom, Teams)
7. **Real-time meeting link generation** (actual Google Meet/Teams API)
8. **Interview notes and scoring** (structured feedback)
9. **Bulk interview scheduling** (batch operations)
10. **Calendar sync** (two-way sync with Google/Outlook)

---

## 📋 **TESTING CHECKLIST**

### Stage 1 (Availability Request):
- [ ] Validate required fields
- [ ] Check Outlook connection
- [ ] Send email successfully
- [ ] Create interview record
- [ ] Handle email failure gracefully

### Stage 2 (Schedule Interview):
- [ ] Validate datetime input
- [ ] Auto-generate meeting link
- [ ] Update interview status
- [ ] Generate .ics file
- [ ] Send confirmation email
- [ ] Download calendar file

### Calendar Integration:
- [ ] Google Calendar import works
- [ ] Outlook import works
- [ ] Apple Calendar import works
- [ ] Reminder alarm appears

### Security:
- [ ] Unauthorized users blocked
- [ ] Users can only access own interviews
- [ ] Outlook tokens are secure

---

## 🎯 **METRICS TO TRACK**

- Total interviews scheduled
- Average time from availability request to scheduling
- Email delivery success rate
- Calendar file download rate
- Interview completion rate
- Candidate selection rate
- User adoption (active users)

---

*Last Updated: December 29, 2025*
