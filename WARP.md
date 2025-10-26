# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Enterprise AI Hub (Nexus)** - A monorepo containing a full-stack enterprise AI platform with separate backend (Express.js/PostgreSQL) and frontend (Next.js) applications. The platform provides HR-focused AI tools including CV Intelligence (HR-01) and Interview Coordinator (HR-02), along with user management, analytics, and support systems.

**Deployment:** Backend on Vercel (`thesimpleai.vercel.app`), Frontend on Netlify (`thesimpleai.netlify.app`)

---

## Essential Commands

### Backend (Node.js/Express + PostgreSQL)

```bash
cd backend

# Development
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server

# Database
npm run init-db          # Initialize database tables (runs on server startup)
npm run seed-db          # Seed database with test data

# Testing & Linting
npm test                 # Run tests (placeholder)
npm run lint             # Lint code (placeholder)
```

### Frontend (Next.js)

```bash
cd frontend

# Development
npm run dev              # Start Next.js dev server (localhost:3000)

# Build & Deploy
npm run build            # Create static export in `out/` directory
npm start                # Start production server (not used for Netlify)

# Linting
npm run lint             # Run Next.js ESLint
```

---

## Architecture Overview

### Backend Architecture

**Pattern:** Layered MVC + Services architecture

**Request Flow:**
```
HTTP Request → Middleware Chain → Router → Controller → Service → Database → Response
```

**Directory Structure:**
- `server.js` - Entry point, middleware setup, route mounting
- `routes/` - Express routers (auth, analytics, support, cv-intelligence, interview-coordinator, notifications, init)
- `controllers/` - Request handlers (AuthController, AnalyticsController, NotificationController, SupportController)
- `services/` - Business logic (cvIntelligenceHR01, interviewCoordinatorService, cacheService, outlookEmailService)
- `models/` - Database interface (database.js singleton, User.js)
- `middleware/` - Request interceptors (auth, cache, rateLimiting, security, validation, performance)
- `scripts/` - Utility scripts (seed-database, fix-ticket-comments)
- `migrations/` - SQL migration files

**Database:** PostgreSQL with auto-initialization on server startup (see `models/database.js::initializeTables()`). The database singleton handles connection pooling, transactions, and schema setup.

**Key Middleware Chain:**
1. `securityHeaders` - Helmet security headers
2. `securityLogger` - Winston-based request logging
3. CORS configuration (environment-driven, allows Netlify deployments)
4. `express.json()` with 10MB limit
5. `requestLogger` - Custom logger with timing
6. Route-specific middleware (auth, rate limiting, caching, validation)

### Frontend Architecture

**Pattern:** Next.js Pages Router with static export

**Directory Structure:**
- `src/pages/` - File-based routing (index, admin, superadmin, cv-intelligence, interview-coordinator, auth, profile, etc.)
- `src/components/` - React components organized by domain (admin, superadmin, user, interview, ui, layout, shared, backgrounds, text, reactbits, common)
- `src/contexts/` - React Context providers (AuthContext for authentication state)
- `src/utils/` - Utility functions (api.js with tokenManager and axios interceptors)
- `src/lib/` - Library code
- `src/styles/` - Global styles and Tailwind CSS

**Build Configuration:** Static export (`output: 'export'`) for Netlify deployment. Images are unoptimized for static hosting.

### Database Schema

**Core Tables:**
- `users` - User accounts with role-based access (superadmin, admin, user)
- `user_sessions` - JWT refresh tokens and session tracking
- `user_preferences` - User settings (theme, notifications, language, timezone)
- `user_analytics` - Activity tracking for analytics
- `agent_usage_stats` - AI agent usage metrics
- `cv_batches` - CV Intelligence batch processing (HR-01)
- `candidates` - Parsed candidate profiles with scores
- `interviews` - Interview scheduling and management (HR-02)
- `interview_reminders` - Automated email reminders
- `support_tickets` - Support ticket system
- `ticket_comments` - Ticket discussion threads
- `notifications` - User notifications
- `system_settings` - Application-wide configuration

**Relationships:** Foreign keys connect users to sessions, analytics, tickets, batches, and interviews. CV/Interview tables intentionally avoid strict FK constraints for flexibility.

### Authentication & Authorization

**Flow:**
1. User logs in via `/api/auth/login`
2. Backend validates credentials, returns `accessToken` (JWT) and `refreshToken`
3. Frontend stores tokens via `tokenManager` (localStorage)
4. Every API request includes `Authorization: Bearer <accessToken>` header
5. Backend middleware `authenticateToken` validates JWT and attaches `req.user`
6. Role-based middleware (`requireSuperAdmin`, `requireAdmin`, `requireRole`) enforces permissions
7. When access token expires, frontend auto-refreshes via `/api/auth/refresh-token`

**Roles:**
- `superadmin` - Full system access (user management, system settings, all features)
- `admin` - Organization-level access (analytics, support tickets, CV/interview management)
- `user` - Standard access (own profile, CV upload, interview participation)

**Security Features:**
- Password hashing with bcryptjs (12 rounds)
- JWT with configurable expiration (default 7 days)
- Rate limiting on auth endpoints (express-rate-limit)
- Account lockout after failed login attempts
- Company domain validation (only `@securemaxtech.com` by default)
- HTTPS enforcement in production
- Security headers via Helmet
- CORS with origin whitelist

---

## Environment Variables

### Backend (.env)

**Required:**
```bash
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret  # Optional, falls back to JWT_SECRET
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
```

**Optional:**
```bash
# Company Configuration
COMPANY_DOMAIN=securemaxtech.com
ADMIN_EMAIL=admin@securemaxtech.com

# Frontend
FRONTEND_URL=https://thesimpleai.netlify.app
CORS_ORIGINS=https://thesimpleai.netlify.app,https://thesimpleai.vercel.app

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@securemaxtech.com
EMAIL_PASS=your_gmail_app_password

# AI Services
OPENAI_API_KEY=sk-...                    # For CV Intelligence
HUGGINGFACE_API_KEY=hf_...               # Alternative AI provider

# File Upload
MAX_FILE_SIZE=10485760                   # 10MB
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15                     # Minutes
RATE_LIMIT_MAX=100                       # Requests per window

# Development
CREATE_DEFAULT_ADMIN=true                # Only in development
```

### Frontend (.env.local)

**Required:**
```bash
NEXT_PUBLIC_API_URL=https://thesimpleai.vercel.app   # Backend API base URL (without /api)
```

**Optional:**
```bash
NEXT_PUBLIC_APP_NAME=Enterprise AI Hub
NEXT_PUBLIC_COMPANY_DOMAIN=securemaxtech.com
```

**Note:** The frontend automatically appends `/api` to `NEXT_PUBLIC_API_URL` for API calls.

---

## Key Features & Implementation

### CV Intelligence (HR-01)

**Service:** `backend/services/cvIntelligenceHR01.js`
**Routes:** `backend/routes/cv-intelligence-clean.js`

**Flow:**
1. Upload CVs (multiple files) + optional JD file → `/api/cv-intelligence/batch`
2. Service parses PDFs using `pdf-parse`
3. If JD provided, AI extracts required skills/experience
4. AI analyzes each CV, extracts profile data (name, email, skills, experience)
5. Smart skill matching compares CV skills to JD requirements using synonym mapping
6. Scoring algorithm ranks candidates (0-100 scale)
7. Results stored in `cv_batches` and `candidates` tables
8. Frontend polls `/api/cv-intelligence/batch/:batchId` for status

**Key Classes:**
- `CVIntelligenceHR01` - Main service class
- `smartSkillMatch()` - Semantic skill matching with synonyms
- `processJobDescription()` - JD parsing and requirement extraction
- `extractJobRequirements()` - AI-powered skill extraction from JD text
- `normalizeSkills()` - Cleans redundant words from skill names

**AI Integration:** Currently uses OpenAI API (gpt-3.5-turbo) as placeholder for Llama 3.1.

### Interview Coordinator (HR-02)

**Service:** `backend/services/interviewCoordinatorService.js`
**Routes:** `backend/routes/interview-coordinator.js`

**Flow:**
1. Admin/HR schedules interview from candidate profile → `/api/interview-coordinator/schedule`
2. Service generates AI-powered interview questions based on candidate CV and job role
3. Creates interview record in `interviews` table
4. Sets up automated reminders in `interview_reminders` table
5. (Optional) Sends calendar invites via Outlook integration
6. Generates meeting links (Calendly) and feedback forms (Google Forms)
7. Tracks interview status lifecycle: scheduled → in_progress → completed → cancelled

**Key Features:**
- AI-generated interview questions tailored to candidate profile
- Automated email reminders (24h before, 1h before, post-interview)
- Outlook/Microsoft Graph integration for calendar management
- Panel member coordination

---

## Common Development Patterns

### Adding a New API Endpoint

1. **Create/update route file** in `backend/routes/`
```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/my-endpoint',
  authenticateToken,           // Auth required
  requireAdmin,                // Admin role required
  async (req, res) => {
    // Handler logic
  }
);

module.exports = router;
```

2. **Mount route** in `backend/server.js`
```javascript
const myRoutes = require('./routes/my-routes');
app.use('/api/my-feature', myRoutes);
```

3. **Add controller** (if complex logic) in `backend/controllers/`
4. **Add service** (if business logic) in `backend/services/`

### Database Queries

**Use the singleton pattern:**
```javascript
const database = require('../models/database');

// Single row
const user = await database.get('SELECT * FROM users WHERE id = $1', [userId]);

// Multiple rows
const users = await database.all('SELECT * FROM users WHERE role = $1', ['admin']);

// Insert/Update/Delete
const result = await database.run(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
  [email, hashedPassword]
);

// Transaction
await database.transaction(async (db) => {
  await db.run('INSERT INTO ...');
  await db.run('UPDATE ...');
});
```

**Note:** PostgreSQL uses `$1, $2, $3` for parameter placeholders (not `?` like SQLite).

### Frontend API Calls

**Using the API utility with auto-refresh:**
```javascript
import { api } from '../utils/api';

// GET request
const response = await api.get('/auth/profile');

// POST request
const response = await api.post('/cv-intelligence/batch', formData);

// With custom headers
const response = await api.post('/endpoint', data, {
  headers: { 'X-Custom-Header': 'value' }
});
```

**Note:** The `api` instance automatically handles:
- Token injection in Authorization header
- Token refresh on 401 errors
- Base URL configuration
- Error response formatting

### Authentication in Components

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Hello {user.first_name}!</div>;
}
```

---

## Troubleshooting

### Backend Issues

**Database connection fails:**
- Verify `DATABASE_URL` is set in `.env`
- Check PostgreSQL credentials and network access
- Ensure database exists and is accessible
- Review connection logs in console (look for ❌ or 🔌 emojis)

**JWT errors:**
- Confirm `JWT_SECRET` is set and matches between restarts
- Check token expiration settings (`JWT_EXPIRES_IN`)
- Verify frontend is sending `Authorization: Bearer <token>` header
- Look for "JWT_SECRET environment variable is required" error on startup

**Routes not loading:**
- Check `server.js` console output for route loading errors (❌ or ✅ emojis)
- Verify route file exports `router` object
- Ensure middleware dependencies are installed
- Check for syntax errors in route files

**Rate limiting triggers:**
- Adjust `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX` in `.env`
- Check `backend/middleware/rateLimiting.js` for endpoint-specific limits
- Clear rate limit by restarting server (in-memory store)

### Frontend Issues

**API calls fail with CORS errors:**
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check backend CORS configuration in `server.js` (line 104-135)
- Ensure origin is in `ALLOWED_ORIGINS` or matches Netlify pattern
- Confirm backend is running and accessible

**Authentication loops / "Token expired" errors:**
- Clear localStorage (`tokenManager.clearTokens()` in console)
- Check backend logs for JWT verification errors
- Verify refresh token endpoint is working (`/api/auth/refresh-token`)
- Ensure `JWT_SECRET` hasn't changed

**Build fails:**
- Run `npm run build` locally to reproduce
- Check for React hydration errors
- Verify all required environment variables are set in Netlify
- Review Next.js static export limitations (no server-side features)

### CV Intelligence Issues

**JD parsing returns empty skills:**
- Verify `OPENAI_API_KEY` is set and valid
- Check backend logs for AI API errors
- Ensure JD file contains text (not scanned image)
- Review `cvIntelligenceHR01.js` prompt engineering

**Candidate scores are all 0:**
- Confirm JD was provided with batch upload
- Check if JD skills were extracted (review batch details)
- Verify CV files are valid PDFs with extractable text
- Review skill matching logic in `smartSkillMatch()`

**Batch stuck in "processing":**
- Check backend logs for errors during processing
- Verify database has candidate records (`SELECT * FROM candidates WHERE batch_id = '...'`)
- Manually update batch status if needed: `UPDATE cv_batches SET status = 'completed' WHERE id = '...'`

---

## Notes

- **Database auto-initializes** on server startup. Tables are created automatically if they don't exist.
- **No manual migrations needed** unless schema changes require data migration (see `backend/migrations/` for reference).
- **Dual deployment:** Backend on Vercel (serverless), Frontend on Netlify (static). API calls go through Netlify proxy.
- **Company domain restriction:** By default, only `@securemaxtech.com` emails can register. Change via `COMPANY_DOMAIN` env var.
- **Development admin creation:** Set `CREATE_DEFAULT_ADMIN=true` in development `.env` to auto-create admin user on startup.
- **PostgreSQL pooling:** Backend uses single connection pool with serverless-optimized settings (max: 1, idle timeout: 1s).
- **Static export limitation:** Frontend cannot use Next.js server-side features (API routes, SSR, ISR). All dynamic behavior must come from backend API.
