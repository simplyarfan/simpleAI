# Enterprise AI Hub - User Journeys & Flow Documentation

**Last Updated:** January 2025  
**System:** Nexus - Enterprise AI Hub (HR-01 & HR-02)

---

## Table of Contents

1. [Authentication & Access Management](#1-authentication--access-management)
2. [CV Intelligence (HR-01)](#2-cv-intelligence-hr-01)
3. [Interview Coordinator (HR-02)](#3-interview-coordinator-hr-02)
4. [Support Ticket System](#4-support-ticket-system)
5. [User Management](#5-user-management)
6. [Profile & Settings](#6-profile--settings)
7. [Analytics & Reporting](#7-analytics--reporting)
8. [Error Handling & Edge Cases](#8-error-handling--edge-cases)

---

## 1. Authentication & Access Management

### 1.1 User Registration Flow

**Actor:** New User  
**Endpoint:** `POST /api/auth/register`  
**Frontend:** `/auth/register`

#### Journey Steps:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User fills registration form                           │
├─────────────────────────────────────────────────────────────────┤
│ Required Fields:                                                │
│ • Email (must be @securemaxtech.com by default)                │
│ • Password (min 8 chars, complex requirements)                 │
│ • First Name                                                    │
│ • Last Name                                                     │
│ • Job Title (optional)                                          │
│ • Department (optional)                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Backend validates & creates user                       │
├─────────────────────────────────────────────────────────────────┤
│ • Check if email already exists                                 │
│ • If exists and verified → reject                               │
│ • If exists and NOT verified → resend verification code         │
│ • If new → hash password (bcrypt, 12 rounds)                   │
│ • Generate 6-digit verification code                            │
│ • Store user with is_verified = FALSE                           │
│ • Store hashed verification code + expiry (15 min)             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Send verification email                                │
├─────────────────────────────────────────────────────────────────┤
│ • Email service sends 6-digit code to user's email              │
│ • Subject: "Verify your email address"                          │
│ • Code valid for 15 minutes                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Redirect to verification page                          │
├─────────────────────────────────────────────────────────────────┤
│ • Frontend receives: { success: true, requiresVerification,    │
│   userId, message }                                             │
│ • Redirects to: /auth/verify-email?userId=XXX                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: User enters 6-digit code                               │
├─────────────────────────────────────────────────────────────────┤
│ • 6 input boxes for each digit                                  │
│ • Auto-focus next input                                         │
│ • Paste support (copies entire 6-digit code)                   │
│ • Resend button (60s cooldown)                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Backend verifies code                                  │
├─────────────────────────────────────────────────────────────────┤
│ Endpoint: POST /api/auth/verify-email                          │
│ • Compare hashed code with user input                           │
│ • Check expiry (15 minutes)                                     │
│ • If valid:                                                     │
│   - Set is_verified = TRUE                                      │
│   - Clear verification_token & expiry                           │
│   - Generate JWT tokens (access + refresh)                      │
│   - Create user session in user_sessions table                  │
│ • If invalid/expired: Show error, allow resend                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Auto-login & redirect                                  │
├─────────────────────────────────────────────────────────────────┤
│ • Store tokens in localStorage (tokenManager)                   │
│ • Store user data in localStorage                               │
│ • Redirect to /dashboard                                        │
│ • Welcome toast notification                                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Edge Cases:

1. **Email already registered (verified)**
   - Response: 400 "User already exists"
   - User directed to login page

2. **Email already registered (unverified)**
   - Generate new verification code
   - Resend email
   - Return same verification flow

3. **Verification code expired**
   - Show error message
   - Enable "Resend code" button
   - Generate new code on resend

4. **Email service failure**
   - User still created in database
   - Log error on backend
   - Continue with flow (in dev, code logged to console)

---

### 1.2 Login Flow

**Actor:** Registered & Verified User  
**Endpoint:** `POST /api/auth/login`  
**Frontend:** `/auth/login`

#### Journey Steps:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User enters credentials                                │
├─────────────────────────────────────────────────────────────────┤
│ • Email                                                         │
│ • Password                                                      │
│ • Remember Me (checkbox, optional)                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Backend validates credentials                          │
├─────────────────────────────────────────────────────────────────┤
│ Security Checks (in order):                                     │
│ 1. User exists? → If not: 401 "Invalid credentials"            │
│ 2. Email verified? → If not: 403 + redirect to verify-email    │
│ 3. Account locked? → If yes: 423 "Account locked"              │
│ 4. Account active? → If not: 401 "Account deactivated"         │
│ 5. Password valid? → bcrypt.compare()                           │
│    If invalid:                                                  │
│    - Increment failed_login_attempts                            │
│    - Lock after 5 attempts (15 min lockout)                     │
│    - Return 401 "Invalid credentials"                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Check 2FA requirement (if enabled)                     │
├─────────────────────────────────────────────────────────────────┤
│ If user.two_factor_enabled === true:                            │
│ • Generate 6-digit 2FA code                                     │
│ • Store hashed code in database (15 min expiry)                │
│ • Send via email                                                │
│ • Return: { success: true, requires2FA: true, userId }          │
│ • Frontend redirects to: /auth/verify-2fa?userId=XXX           │
│                                                                 │
│ If 2FA disabled → Proceed to Step 4                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Generate tokens & create session                       │
├─────────────────────────────────────────────────────────────────┤
│ • Reset failed_login_attempts to 0                              │
│ • Clear account_locked_until                                    │
│ • Update last_login timestamp                                   │
│ • Generate JWT access token (24h expiry)                        │
│ • Generate JWT refresh token (30d or 90d if remember me)       │
│ • Store session in user_sessions table                          │
│ • Track login in user_analytics                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Return tokens & user data                              │
├─────────────────────────────────────────────────────────────────┤
│ Response: {                                                     │
│   success: true,                                                │
│   token: "JWT_ACCESS_TOKEN",                                    │
│   refreshToken: "JWT_REFRESH_TOKEN",                            │
│   user: { id, email, first_name, last_name, role, ... }        │
│ }                                                               │
│                                                                 │
│ Frontend:                                                       │
│ • Store tokens via tokenManager                                 │
│ • Update AuthContext state                                      │
│ • Redirect to returnUrl or /dashboard                           │
└─────────────────────────────────────────────────────────────────┘
```

#### Remember Me Feature:

- **When enabled:**
  - Refresh token validity: 90 days (vs 30 days)
  - Email stored in localStorage
  - Auto-fill email on next visit

---

### 1.3 Email Verification Resend Flow

**Endpoint:** `POST /api/auth/resend-verification`  
**Rate Limit:** 60 seconds cooldown

```
User clicks "Resend code"
         ↓
Backend checks user exists & not verified
         ↓
Generate new 6-digit code
         ↓
Update verification_token & expiry in database
         ↓
Send email with new code
         ↓
Return success → Frontend shows 60s cooldown
```

---

### 1.4 Password Reset Flow

**Endpoints:**
- Request: `POST /api/auth/forgot-password`
- Reset: `POST /api/auth/reset-password`

**Frontend:**
- Request: `/auth/forgot-password`
- Reset: `/auth/reset-password?token=XXX`

#### Journey Steps:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User requests password reset                           │
├─────────────────────────────────────────────────────────────────┤
│ • Enter email on forgot-password page                           │
│ • Submit form                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Backend generates reset token                          │
├─────────────────────────────────────────────────────────────────┤
│ • Check if user exists (don't reveal if doesn't)                │
│ • Generate secure 64-char hex token                             │
│ • Hash token with bcrypt                                        │
│ • Store hashed token with 1-hour expiry                         │
│ • Send email with reset link                                    │
│ • Link: https://app/auth/reset-password?token=XXXX              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: User clicks email link                                 │
├─────────────────────────────────────────────────────────────────┤
│ • Opens reset-password page with token in URL                   │
│ • Form shows: New Password + Confirm Password fields            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: User enters new password                               │
├─────────────────────────────────────────────────────────────────┤
│ • Password validation (min 8 chars)                             │
│ • Passwords must match                                          │
│ • Submit → POST /api/auth/reset-password                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Backend processes reset                                │
├─────────────────────────────────────────────────────────────────┤
│ • Get all users with active reset tokens                        │
│ • Compare token hash with each (find match)                     │
│ • Check token not expired (1 hour)                              │
│ • Hash new password (bcrypt, 12 rounds)                         │
│ • Update password_hash                                          │
│ • Clear reset_token & reset_token_expiry                        │
│ • Invalidate ALL existing sessions (security)                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Redirect to login                                      │
├─────────────────────────────────────────────────────────────────┤
│ • Success message: "Password reset successful"                  │
│ • User must login with new password                             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1.5 Two-Factor Authentication (2FA) Flow

**Enable:** `POST /api/auth/enable-2fa`  
**Disable:** `POST /api/auth/disable-2fa`  
**Verify:** `POST /api/auth/verify-2fa`

#### Enable 2FA:

```
User navigates to Profile → Security Settings
         ↓
Clicks "Enable 2FA"
         ↓
Backend generates 6-digit code
         ↓
Code sent to user's email
         ↓
User enters code on verify-2fa page
         ↓
Backend verifies code
         ↓
Set two_factor_enabled = TRUE
         ↓
Success → 2FA now required on all future logins
```

#### Login with 2FA:

```
User enters email + password
         ↓
Backend checks two_factor_enabled === true
         ↓
Generate 6-digit code → Send email
         ↓
Return: { requires2FA: true, userId }
         ↓
Frontend redirects to /auth/verify-2fa?userId=XXX
         ↓
User enters 6-digit code
         ↓
Backend verifies → Complete login process
         ↓
Generate tokens → Create session → Login successful
```

---

### 1.6 Token Refresh Flow

**Endpoint:** `POST /api/auth/refresh-token`  
**Automatic:** Handled by axios interceptor in frontend

```
API request receives 401 Unauthorized
         ↓
Axios interceptor catches error
         ↓
Check if refresh token exists
         ↓
POST /api/auth/refresh-token with refresh token
         ↓
Backend validates refresh token (JWT)
         ↓
Generate new access token (24h)
         ↓
Generate new refresh token
         ↓
Update user_sessions table
         ↓
Return new tokens → Frontend stores them
         ↓
Retry original failed request with new token
```

**If refresh fails:** Logout user → Redirect to login

---

### 1.7 Logout Flow

**Endpoints:**
- Single device: `POST /api/auth/logout`
- All devices: `POST /api/auth/logout-all`

```
User clicks Logout
         ↓
Frontend calls logout endpoint with access token
         ↓
Backend deletes session from user_sessions table
         ↓
If logout-all → Delete ALL sessions for user
         ↓
Frontend clears tokens & user data from localStorage
         ↓
Reset AuthContext state
         ↓
Redirect to /auth/login
```

---

## 2. CV Intelligence (HR-01)

**Purpose:** AI-powered CV screening and candidate ranking  
**Actors:** HR Admin, Hiring Manager, Recruiter  
**Routes:** `/api/cv-intelligence/*`  
**Frontend:** `/cv-intelligence`

### 2.1 Complete CV Screening Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Batch Creation                                        │
├─────────────────────────────────────────────────────────────────┤
│ User navigates to CV Intelligence page                          │
│ Clicks "New CV Screening Batch"                                 │
│                                                                 │
│ POST /api/cv-intelligence/                                      │
│ Body: { name: "Software Engineer Q1 2025" }                     │
│                                                                 │
│ Backend:                                                        │
│ • Generate unique batch ID (batch_timestamp_random)             │
│ • Create cv_batches record:                                     │
│   - status: 'created'                                           │
│   - user_id: req.user.id                                        │
│   - total_resumes: 0                                            │
│   - processed_resumes: 0                                        │
│                                                                 │
│ Response: { batchId, name, status: 'created' }                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: File Upload                                           │
├─────────────────────────────────────────────────────────────────┤
│ User uploads files:                                             │
│ • CV Files: 1-10 PDFs/DOCX (max 10MB each)                     │
│ • JD File: 1 PDF/DOCX (optional but recommended)               │
│                                                                 │
│ Frontend validation:                                            │
│ • File types: application/pdf, .docx                            │
│ • Size limit: 10MB per file                                     │
│ • Max 10 CVs per batch                                          │
│                                                                 │
│ POST /api/cv-intelligence/batch/:id/process                     │
│ Content-Type: multipart/form-data                               │
│ Fields:                                                         │
│ • cvFiles[] (array of files)                                    │
│ • jdFile (single file, optional)                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: Job Description Processing (if provided)              │
├─────────────────────────────────────────────────────────────────┤
│ Backend extracts JD text:                                       │
│ • Use pdf-parse for PDFs                                        │
│ • Use mammoth for DOCX                                          │
│                                                                 │
│ AI Processing (OpenAI GPT-3.5-turbo):                           │
│ • Prompt: "Extract required skills, experience, education       │
│   from this job description..."                                 │
│ • Parse JSON response                                           │
│                                                                 │
│ Extracted Requirements:                                         │
│ {                                                               │
│   skills: ["JavaScript", "React", "Node.js", ...],             │
│   mustHave: ["JavaScript", "3+ years experience"],             │
│   experience: "3-5 years in software development",             │
│   education: "Bachelor's in Computer Science or equivalent"    │
│ }                                                               │
│                                                                 │
│ Store in cv_batches.jd_requirements (JSON)                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: CV Parsing & Analysis                                 │
├─────────────────────────────────────────────────────────────────┤
│ For each CV file:                                               │
│                                                                 │
│ 4.1 Extract Text:                                               │
│ • Parse PDF/DOCX → Plain text                                   │
│ • Clean and normalize text                                      │
│                                                                 │
│ 4.2 AI Extraction (OpenAI):                                     │
│ Prompt: "Extract structured data from CV..."                    │
│ Extract:                                                        │
│ • Name                                                          │
│ • Email                                                         │
│ • Phone                                                         │
│ • Skills (array)                                                │
│ • Experience (years, companies, roles)                          │
│ • Education                                                     │
│ • Projects                                                      │
│ • Certifications                                                │
│                                                                 │
│ 4.3 Smart Skill Matching:                                       │
│ If JD requirements exist:                                       │
│ • Compare candidate skills with JD skills                       │
│ • Use synonym mapping:                                          │
│   - "javascript" matches ["js", "nodejs", "node"]              │
│   - "react" matches ["reactjs", "react.js"]                    │
│   - "python" matches ["py", "python3"]                         │
│ • Calculate match percentage                                    │
│                                                                 │
│ 4.4 Scoring Algorithm:                                          │
│ Base score calculation:                                         │
│ • Skill match: 40 points (if JD provided)                       │
│ • Experience match: 30 points                                   │
│ • Education match: 20 points                                    │
│ • Keywords presence: 10 points                                  │
│                                                                 │
│ Final score: 0-100 scale                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5: Database Storage                                      │
├─────────────────────────────────────────────────────────────────┤
│ For each processed CV:                                          │
│                                                                 │
│ INSERT INTO cv_candidates:                                      │
│ • id (unique candidate ID)                                      │
│ • batch_id (FK to cv_batches)                                   │
│ • name (normalized: Title Case)                                 │
│ • email                                                         │
│ • phone                                                         │
│ • skills (JSON array)                                           │
│ • experience (JSON object)                                      │
│ • education (JSON object)                                       │
│ • score (0-100)                                                 │
│ • match_details (JSON - breakdown of scoring)                   │
│ • raw_text (original CV text)                                   │
│ • created_at                                                    │
│                                                                 │
│ Update cv_batches:                                              │
│ • processed_resumes += 1                                        │
│ • If processed_resumes === total_resumes:                       │
│   status = 'completed'                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 6: Results Display                                       │
├─────────────────────────────────────────────────────────────────┤
│ Frontend polls: GET /api/cv-intelligence/batch/:id              │
│ (every 2 seconds while processing)                              │
│                                                                 │
│ Response includes:                                              │
│ {                                                               │
│   batch: {                                                      │
│     id, name, status,                                           │
│     total_resumes, processed_resumes,                           │
│     jd_requirements                                             │
│   },                                                            │
│   candidates: [                                                 │
│     { id, name, email, skills, score, ... }                     │
│   ]                                                             │
│ }                                                               │
│                                                                 │
│ Display:                                                        │
│ • Candidates sorted by score (highest first)                    │
│ • Color-coded scores:                                           │
│   - Green: 80-100 (Excellent match)                             │
│   - Yellow: 60-79 (Good match)                                  │
│   - Orange: 40-59 (Fair match)                                  │
│   - Red: 0-39 (Poor match)                                      │
│ • Skill comparison visualization                                │
│ • Export options (CSV, PDF)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Candidate Detail View

**Endpoint:** `GET /api/cv-intelligence/candidate/:id`

```
User clicks on candidate card
         ↓
Navigate to /cv-intelligence/candidate/:id
         ↓
Backend fetches full candidate details
         ↓
Display:
• Full profile information
• Detailed skill breakdown
• Experience timeline
• Education history
• Match percentage vs JD requirements
• Score breakdown by category
• Actions:
  - Schedule interview (links to HR-02)
  - Export profile
  - Add notes
  - Move to shortlist
```

---

## 3. Interview Coordinator (HR-02)

**Purpose:** Multi-stage interview scheduling and coordination  
**Actors:** HR Admin, Hiring Manager, Panel Members, Candidates  
**Routes:** `/api/interview-coordinator/*`  
**Frontend:** `/interview-coordinator`

### 3.1 Complete Interview Scheduling Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: Availability Request                                  │
├─────────────────────────────────────────────────────────────────┤
│ Trigger:                                                        │
│ • From CV Intelligence → "Schedule Interview" button            │
│ • Or directly from Interview Coordinator page                   │
│                                                                 │
│ User fills availability request form:                           │
│ • Candidate Name (auto-filled if from HR-01)                    │
│ • Candidate Email (auto-filled if from HR-01)                   │
│ • Position/Role                                                 │
│ • Google Form Link (for availability collection)               │
│ • Email Subject (customizable)                                  │
│ • Email Content (template provided, editable)                   │
│ • CC Emails (optional)                                          │
│ • BCC Emails (optional)                                         │
│                                                                 │
│ POST /api/interview-coordinator/request-availability            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: Email Sending (via Outlook)                           │
├─────────────────────────────────────────────────────────────────┤
│ Prerequisites Check:                                            │
│ • User must have connected Outlook account                      │
│ • Check outlook_access_token in users table                     │
│ • If missing → Return 400 "Connect Outlook first"               │
│                                                                 │
│ Email Composition:                                              │
│ • Microsoft Graph API: POST /me/sendMail                        │
│ • Subject: Custom or default template                           │
│ • Body: Personalized with candidate name, position             │
│ • Include Google Form link for availability                     │
│ • CC/BCC if provided                                            │
│                                                                 │
│ Email Template Example:                                         │
│ "Dear [Candidate Name],                                         │
│                                                                 │
│  We are pleased to inform you that we have shortlisted you     │
│  for an interview for the [Position] position.                 │
│                                                                 │
│  Please provide your availability by filling out this form:    │
│  [Google Form Link]                                             │
│                                                                 │
│  Best regards,                                                  │
│  [Company] HR Team"                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 3: Interview Record Creation                             │
├─────────────────────────────────────────────────────────────────┤
│ After successful email send:                                    │
│                                                                 │
│ INSERT INTO interviews:                                         │
│ • id (interview_timestamp_random)                               │
│ • candidate_id                                                  │
│ • candidate_name                                                │
│ • candidate_email                                               │
│ • position                                                      │
│ • status: 'availability_requested'                              │
│ • stage: 'availability_request'                                 │
│ • google_form_link                                              │
│ • scheduled_by (user ID)                                        │
│ • created_at                                                    │
│                                                                 │
│ Response:                                                       │
│ {                                                               │
│   success: true,                                                │
│   interviewId,                                                  │
│   message: "Availability request sent successfully"            │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 4: Candidate Responds (External)                         │
├─────────────────────────────────────────────────────────────────┤
│ Candidate:                                                      │
│ • Receives email                                                │
│ • Opens Google Form                                             │
│ • Submits availability slots                                    │
│                                                                 │
│ HR manually reviews Google Form responses                       │
│ (This step is external to the system)                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 5: Schedule Final Interview                              │
├─────────────────────────────────────────────────────────────────┤
│ HR clicks "Schedule Interview" on interview record              │
│                                                                 │
│ POST /api/interview-coordinator/schedule                        │
│ Body: {                                                         │
│   candidateId,                                                  │
│   candidateName,                                                │
│   candidateEmail,                                               │
│   position,                                                     │
│   interviewDate: "2025-02-15",                                  │
│   interviewTime: "14:00",                                       │
│   interviewType: "technical" | "hr" | "behavioral",            │
│   panelMembers: ["email1@company.com", "email2@..."],          │
│   meetingLink: "https://teams.microsoft.com/...",              │
│   notes: "Technical round - focus on React/Node.js"            │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 6: AI Question Generation                                │
├─────────────────────────────────────────────────────────────────┤
│ Backend generates interview questions:                          │
│                                                                 │
│ If candidate came from HR-01 (CV Intelligence):                 │
│ • Fetch candidate CV data                                       │
│ • Extract skills, experience, projects                          │
│ • AI Prompt:                                                    │
│   "Generate 10 interview questions for [Position] based on     │
│    candidate's profile: [Skills], [Experience]..."             │
│                                                                 │
│ If candidate external:                                          │
│ • Generate questions based on position only                     │
│                                                                 │
│ Question Categories:                                            │
│ • Technical (4-5 questions)                                     │
│ • Behavioral (3-4 questions)                                    │
│ • Situational (2-3 questions)                                   │
│                                                                 │
│ Store questions in interview record (JSON field)                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 7: Send Interview Confirmation                           │
├─────────────────────────────────────────────────────────────────┤
│ Email sent to:                                                  │
│ • Candidate (TO)                                                │
│ • Panel members (CC)                                            │
│                                                                 │
│ Email includes:                                                 │
│ • Date & time                                                   │
│ • Meeting link (Teams/Zoom/Google Meet)                         │
│ • Interview type                                                │
│ • Panel member names                                            │
│ • Calendar invite (.ics attachment)                             │
│                                                                 │
│ Update interview record:                                        │
│ • status: 'scheduled'                                           │
│ • interview_date                                                │
│ • interview_time                                                │
│ • panel_members                                                 │
│ • meeting_link                                                  │
│ • questions (AI-generated)                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 8: Automated Reminders                                   │
├─────────────────────────────────────────────────────────────────┤
│ INSERT INTO interview_reminders:                                │
│                                                                 │
│ Reminder Schedule:                                              │
│ 1. 24 hours before interview                                    │
│    • Email to candidate & panel                                 │
│    • Subject: "Interview reminder - Tomorrow at [time]"         │
│                                                                 │
│ 2. 1 hour before interview                                      │
│    • Email to candidate & panel                                 │
│    • Include meeting link prominently                           │
│                                                                 │
│ 3. Post-interview (2 hours after end time)                      │
│    • Feedback form link to panel                                │
│    • Update status to 'completed'                               │
│                                                                 │
│ Background job checks interview_reminders table every 5 min     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 9: Interview Completion & Feedback                       │
├─────────────────────────────────────────────────────────────────┤
│ Panel members receive feedback form:                            │
│ • Google Form with AI-generated questions                       │
│ • Rating scales (1-5) for each skill area                       │
│ • Comments section                                              │
│ • Hire/No Hire recommendation                                   │
│                                                                 │
│ HR can:                                                         │
│ • Update interview status manually                              │
│ • Add notes                                                     │
│ • Schedule follow-up rounds                                     │
│ • Mark as "hired", "rejected", or "pending"                     │
│                                                                 │
│ PUT /api/interview-coordinator/interview/:id                    │
│ Body: { status, notes, outcome }                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Interview Status Lifecycle

```
availability_requested
         ↓
availability_received (manual update)
         ↓
scheduled
         ↓
in_progress (auto-update at start time)
         ↓
completed
         ↓
hired / rejected / next_round
```

### 3.3 Outlook Integration

**Connect Outlook:**

```
User goes to Profile → Outlook Settings
         ↓
Clicks "Connect Outlook"
         ↓
OAuth 2.0 Flow:
• Redirect to Microsoft login
• Request permissions: Mail.Send, Calendars.ReadWrite
• Receive authorization code
         ↓
Exchange code for access token
         ↓
Store in users table:
• outlook_access_token
• outlook_refresh_token
• outlook_email
• outlook_token_expiry
         ↓
Token refresh handled automatically when expired
```

---

## 4. Support Ticket System

**Purpose:** Internal helpdesk for users to report issues  
**Actors:** All authenticated users (create), Admins (manage)  
**Routes:** `/api/support/*`  
**Frontend:** `/support`

### 4.1 Create Support Ticket Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User opens support page                                │
├─────────────────────────────────────────────────────────────────┤
│ Navigate to /support                                            │
│ Click "Create New Ticket"                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Fill ticket form                                       │
├─────────────────────────────────────────────────────────────────┤
│ Required Fields:                                                │
│ • Title (max 200 chars)                                         │
│ • Description (detailed explanation)                            │
│ • Category:                                                     │
│   - "technical" (bugs, errors)                                  │
│   - "account" (login, access issues)                            │
│   - "feature_request" (new functionality)                       │
│   - "cv_intelligence" (HR-01 issues)                            │
│   - "interview_coordinator" (HR-02 issues)                      │
│   - "other"                                                     │
│ • Priority:                                                     │
│   - "low" (minor inconvenience)                                 │
│   - "medium" (affects work but workaround exists)               │
│   - "high" (blocks work, no workaround)                         │
│   - "critical" (system down, data loss risk)                    │
│                                                                 │
│ Optional:                                                       │
│ • Attachments (screenshots, logs)                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Backend creates ticket                                 │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/support/                                              │
│                                                                 │
│ INSERT INTO support_tickets:                                    │
│ • id (auto-increment)                                           │
│ • user_id (from auth token)                                     │
│ • title                                                         │
│ • description                                                   │
│ • category                                                      │
│ • priority                                                      │
│ • status: 'open' (default)                                      │
│ • assigned_to: NULL (unassigned initially)                      │
│ • created_at                                                    │
│                                                                 │
│ Create notification for admins:                                 │
│ INSERT INTO notifications (for all admin/superadmin users)      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Display ticket confirmation                            │
├─────────────────────────────────────────────────────────────────┤
│ Show ticket details:                                            │
│ • Ticket ID: #12345                                             │
│ • Status: Open                                                  │
│ • Estimated response time: 24-48 hours (based on priority)     │
│ • Link to track ticket                                          │
│                                                                 │
│ User can:                                                       │
│ • View ticket details                                           │
│ • Add comments                                                  │
│ • Upload additional files                                       │
│ • Close ticket (if resolved)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Ticket Comments & Discussion

```
User/Admin adds comment
         ↓
POST /api/support/:ticket_id/comments
Body: { message, is_internal: false }
         ↓
INSERT INTO ticket_comments:
• ticket_id
• user_id
• message
• is_internal (admin-only flag)
• created_at
         ↓
Create notification:
• If user comments → Notify assigned admin
• If admin comments → Notify ticket creator
         ↓
Update ticket: updated_at = NOW()
```

### 4.3 Admin Ticket Management

**Get all tickets:**

```
GET /api/support/admin/all?page=1&status=open&priority=high
         ↓
Returns paginated list with filters:
• Status: open, in_progress, resolved, closed
• Priority: low, medium, high, critical
• Category: technical, account, etc.
• Search by title/description
• Sort by: created_at, priority, status
```

**Assign ticket:**

```
PUT /api/support/:ticket_id
Body: { assigned_to: admin_user_id }
         ↓
Update support_tickets SET assigned_to, status='in_progress'
         ↓
Notify assigned admin
```

**Resolve ticket:**

```
PUT /api/support/:ticket_id
Body: { status: 'resolved', resolution_notes }
         ↓
Update ticket status
         ↓
Notify user: "Your ticket has been resolved"
```

### 4.4 Support Statistics (Admin)

**Endpoint:** `GET /api/support/admin/stats`

```
Returns:
{
  total_tickets: 150,
  open_tickets: 25,
  in_progress_tickets: 15,
  resolved_tickets: 90,
  closed_tickets: 20,
  avg_resolution_time: "2.5 days",
  tickets_by_category: {
    technical: 60,
    account: 30,
    feature_request: 20,
    ...
  },
  tickets_by_priority: {
    critical: 5,
    high: 20,
    medium: 80,
    low: 45
  },
  recent_activity: [ ... ]
}
```

---

## 5. User Management

**Purpose:** Superadmin-only user administration  
**Routes:** `/api/auth/users/*`  
**Frontend:** `/superadmin/users`

### 5.1 View All Users

```
GET /api/auth/users?page=1&limit=20&role=user&search=john
         ↓
Backend:
• Authenticate + Check role = 'superadmin'
• Query users with filters & pagination
• Return sanitized user list (no password hashes)
         ↓
Frontend displays:
• User table with columns:
  - Name, Email, Role, Status, Created Date
• Actions: Edit, Delete, Reset Password
• Filters: Role, Status, Search
```

### 5.2 Create New User

```
POST /api/auth/users
Body: {
  email, password, firstName, lastName,
  role, department, jobTitle
}
         ↓
Backend:
• Validate superadmin role
• Check email uniqueness
• Hash password
• Create user with is_verified=true (admin-created)
• Generate temporary password if not provided
         ↓
Response:
{
  user: { ... },
  temporaryPassword: "abc123xyz" (if auto-generated)
}
         ↓
Admin can send credentials to new user manually
```

### 5.3 Update User

```
PUT /api/auth/users/:user_id
Body: {
  first_name, last_name, email, role,
  department, job_title, is_active,
  newPassword (optional)
}
         ↓
Backend:
• Validate superadmin role
• Update user record
• If newPassword provided → hash & update
         ↓
Track activity: 'user_updated'
```

### 5.4 Delete User

```
DELETE /api/auth/users/:user_id
         ↓
Backend:
• Validate superadmin role
• Prevent self-deletion
• Count related data:
  - CV batches & candidates
  - Support tickets & comments
  - Interviews
  - Sessions
  - Notifications
         ↓
Delete user (CASCADE handles related data)
         ↓
Return deleted data summary:
{
  user: "John Doe (john@company.com)",
  relatedItemsDeleted: {
    cvBatches: 5,
    cvCandidates: 45,
    supportTickets: 3,
    ...
  },
  totalItemsDeleted: 67
}
```

---

## 6. Profile & Settings

**Routes:** `/api/auth/profile`  
**Frontend:** `/profile`

### 6.1 View Profile

```
GET /api/auth/profile
         ↓
Returns:
{
  id, email, first_name, last_name,
  role, department, job_title,
  is_active, created_at, last_login,
  two_factor_enabled,
  outlook_connected: !!outlook_access_token
}
```

### 6.2 Update Profile

```
PUT /api/auth/profile
Body: {
  first_name, last_name,
  department, job_title
}
         ↓
Update users table
         ↓
Return updated profile
```

### 6.3 Change Password

```
PUT /api/auth/change-password
Body: {
  currentPassword,
  newPassword
}
         ↓
Backend:
• Verify currentPassword matches
• Hash newPassword
• Update password_hash
• Track activity: 'password_changed'
         ↓
Success → Recommend user re-login on other devices
```

### 6.4 Enable/Disable 2FA

**Enable:**

```
POST /api/auth/enable-2fa
         ↓
Generate 6-digit code → Send email
         ↓
User verifies code on /auth/verify-2fa
         ↓
Set two_factor_enabled = true
```

**Disable:**

```
POST /api/auth/disable-2fa
Body: { password } (confirmation)
         ↓
Verify password
         ↓
Set two_factor_enabled = false
```

---

## 7. Analytics & Reporting

**Routes:** `/api/analytics/*`  
**Frontend:** `/admin/analytics`

### 7.1 System Overview

```
GET /api/analytics/overview
         ↓
Returns:
{
  users: {
    total: 150,
    active_today: 45,
    new_this_week: 8
  },
  cv_intelligence: {
    total_batches: 35,
    total_candidates: 420,
    avg_score: 67.5
  },
  interviews: {
    scheduled: 15,
    completed: 80,
    success_rate: 0.65
  },
  support: {
    open_tickets: 12,
    avg_response_time: "4.2 hours"
  }
}
```

### 7.2 User Activity Tracking

**All tracked activities:**

- registration
- login, logout
- profile_viewed, profile_updated
- password_changed
- 2fa_enabled, 2fa_disabled
- email_verification
- cv_batch_created, cv_processed
- interview_scheduled
- support_ticket_created
- users_viewed, user_created, user_updated

**Tracked in:** `user_analytics` table

```
GET /api/analytics/user-activity?timeframe=7d
         ↓
Returns activity breakdown by:
• Action type
• User
• Timestamp
• IP address
```

---

## 8. Error Handling & Edge Cases

### 8.1 Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "requiresVerification": true,
  "userId": 123,
  "message": "Please verify your email address first"
}
```

**423 Locked:**
```json
{
  "success": false,
  "message": "Account locked due to failed login attempts"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An error occurred",
  "error": "Detailed error (dev only)"
}
```

### 8.2 Rate Limiting

**Auth endpoints:** 15 requests / 15 minutes  
**Password reset:** 3 requests / hour  
**Email verification resend:** 5 requests / hour  
**Support ticket creation:** 5 tickets / hour  
**CV batch processing:** 10 batches / hour  
**General API:** 100 requests / 15 minutes

---

## System Architecture Summary

### Frontend Stack:
- Next.js (Pages Router, Static Export)
- React Context API (Authentication)
- Tailwind CSS + Custom Components
- Axios with interceptors (Auto token refresh)

### Backend Stack:
- Node.js + Express.js
- PostgreSQL (connection pooling)
- JWT authentication (access + refresh tokens)
- bcryptjs (password hashing)
- OpenAI API (CV parsing, question generation)
- Microsoft Graph API (Outlook integration)
- Nodemailer (Email service)

### Security Features:
- Email verification mandatory
- Password hashing (12 rounds)
- JWT with refresh tokens
- Account lockout (5 failed attempts)
- Rate limiting on all endpoints
- Role-based access control (superadmin, admin, user)
- Session tracking
- Activity logging

### Deployment:
- Backend: Vercel (serverless)
- Frontend: Netlify (static)
- Database: PostgreSQL (managed)

---

**End of User Journeys Documentation**
