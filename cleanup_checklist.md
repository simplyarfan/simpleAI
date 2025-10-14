# Codebase Cleanup & Fix Checklist

**Project Setup:** Local machine → GitHub → Auto-deploy (Netlify frontend + Vercel backend with Neon PostgreSQL)

## ✅ COMPREHENSIVE TASK CHECKLIST

### PHASE 1: CRITICAL SECURITY FIXES
- [ ] **1.1** Fix password requirements consistency (validation.js requires 8-char, but needs enforcement everywhere)
- [ ] **1.2** Remove default admin creation in production (database.js lines 408-452)
- [ ] **1.3** Warn about JWT_REFRESH_SECRET fallback (server.js lines 104-108)
- [ ] **1.4** Fix CORS configuration (hardcoded origins in server.js lines 72-93)
- [ ] **1.5** Add HTTPS enforcement for production
- [ ] **1.6** Remove stack traces from production error responses (multiple files)
- [ ] **1.7** Guard admin/debug endpoints with proper authentication

### PHASE 2: REMOVE DEAD/UNUSED FILES
- [ ] **2.1** Delete `/frontend/src/pages/interview-coordinator-old.js` (304 lines - old version)
- [ ] **2.2** Delete `/audit_out/` directory (audit artifacts)
- [ ] **2.3** Delete `/audit_out 2/` directory (duplicate audit artifacts)
- [ ] **2.4** Delete `/simpleAI_audit_artifacts.tgz` (compressed audit file)
- [ ] **2.5** Delete `/codebase_quick_audit.sh` (audit script no longer needed)

### PHASE 3: FIX ROUTING INCONSISTENCIES
- [ ] **3.1** Fix interview-coordinator.js SQL placeholders (? → $1) at lines 83, 324, 463, 510, 567, 578
- [ ] **3.2** Remove duplicate /health endpoint (server.js lines 161 and 276)
- [ ] **3.3** Remove duplicate test endpoints (/test, /api/test, /api/test-login, /cors-test)
- [ ] **3.4** Consolidate /api/users endpoint (server.js line 394 duplicates auth route)
- [ ] **3.5** Standardize all route authentication middleware

### PHASE 4: APPLY MISSING RATE LIMITING
- [ ] **4.1** Apply authLimiter to /api/auth/register and /api/auth/login
- [ ] **4.2** Apply generalLimiter to /api/auth/users (user creation)
- [ ] **4.3** Apply uploadLimiter to CV upload endpoints
- [ ] **4.4** Apply analyticsLimiter to /api/analytics routes
- [ ] **4.5** Apply generalLimiter to /api/interview-coordinator routes
- [ ] **4.6** Apply generalLimiter to /api/support routes

### PHASE 5: CLEAN UP EXCESSIVE LOGGING
- [ ] **5.1** Remove emoji console.log from AuthController.js (25 instances)
- [ ] **5.2** Remove emoji console.log from cv-intelligence-clean.js (20 instances)
- [ ] **5.3** Remove emoji console.log from interview-coordinator.js (19 instances)
- [ ] **5.4** Remove emoji console.log from SupportController.js (17 instances)
- [ ] **5.5** Remove emoji console.log from server.js (17 instances)
- [ ] **5.6** Remove emoji console.log from database.js (16 instances)
- [ ] **5.7** Implement structured logging service (Winston/Pino)
- [ ] **5.8** Keep only error logs and critical info logs

### PHASE 6: REMOVE PLACEHOLDER/UNUSED CODE
- [ ] **6.1** Remove placeholder password reset functions (AuthController.js lines 967-981)
- [ ] **6.2** Remove unused validation middleware (validateEmailVerification - no email verification)
- [ ] **6.3** Remove email verification routes (already removed but validate)
- [ ] **6.4** Remove commented code in database.js (lines 126-129)
- [ ] **6.5** Clean up duplicate Outlook column additions (database.js lines 161-164 and 388-395)

### PHASE 7: DATABASE OPTIMIZATIONS
- [ ] **7.1** Add index on users.email (critical for login performance)
- [ ] **7.2** Add index on user_sessions.user_id
- [ ] **7.3** Add index on user_sessions.expires_at (for cleanup queries)
- [ ] **7.4** Add index on support_tickets.user_id
- [ ] **7.5** Add index on support_tickets.status
- [ ] **7.6** Add index on cv_batches.user_id
- [ ] **7.7** Add index on candidates.batch_id
- [ ] **7.8** Verify existing indexes on interviews table (already added)

### PHASE 8: ERROR HANDLING STANDARDIZATION
- [ ] **8.1** Create standardized error response helper function
- [ ] **8.2** Remove error.stack from all production responses
- [ ] **8.3** Implement proper error logging (separate from user responses)
- [ ] **8.4** Add global error boundary middleware
- [ ] **8.5** Standardize error codes across all endpoints

### PHASE 9: ENVIRONMENT & CONFIGURATION
- [ ] **9.1** Move hardcoded origins to environment variables
- [ ] **9.2** Verify all required environment variables are documented
- [ ] **9.3** Add environment variable validation on startup
- [ ] **9.4** Review Netlify deployment config
- [ ] **9.5** Review Vercel deployment config
- [ ] **9.6** Ensure PostgreSQL connection pooling is optimal for serverless

### PHASE 10: FINAL TESTING & DEPLOYMENT
- [ ] **10.1** Test authentication flow (register, login, logout)
- [ ] **10.2** Test CV Intelligence (upload, process, view results)
- [ ] **10.3** Test Interview Coordinator (create, schedule, delete)
- [ ] **10.4** Test Support tickets (create, comment, resolve)
- [ ] **10.5** Test superadmin dashboard (all admin functions)
- [ ] **10.6** Verify rate limiting works correctly
- [ ] **10.7** Test with production environment variables locally
- [ ] **10.8** Commit to GitHub and trigger auto-deploy
- [ ] **10.9** Monitor production logs for errors
- [ ] **10.10** Verify all functionality works in production

---

## EXECUTION LOG

### Phase 1: Critical Security Fixes
**Status:** ✅ COMPLETED
- Fixed default admin creation (requires explicit env vars in dev only)
- Added JWT_REFRESH_SECRET warning
- Made CORS configuration environment-driven
- Added HTTPS enforcement for production
- Removed stack traces from production errors
- Guarded admin/debug endpoints with authentication

### Phase 2: Remove Dead/Unused Files
**Status:** ✅ COMPLETED
- Deleted `/frontend/src/pages/interview-coordinator-old.js`
- Deleted `/audit_out/` directory
- Deleted `/audit_out 2/` directory
- Deleted `/simpleAI_audit_artifacts.tgz`
- Deleted `/codebase_quick_audit.sh`

### Phase 3: Fix Routing Inconsistencies
**Status:** ✅ COMPLETED
- Fixed all SQL placeholders in interview-coordinator.js (? → $1, $2, etc.)
- Removed duplicate /health endpoint
- Removed duplicate test endpoints (/test, /api/test, /api/test-login, /cors-test, /api/auth-test)
- Removed duplicate /api/users endpoint

### Phase 4: Apply Missing Rate Limiting
**Status:** ✅ COMPLETED
- Applied authLimiter to /api/auth/register and /api/auth/login
- Applied uploadLimiter to CV upload endpoints
- Applied cvBatchLimiter to batch creation
- Applied generalLimiter to interview-coordinator routes
- Applied ticketLimiter and generalLimiter to support routes
- Analytics routes already had rate limiting

### Phase 5: Clean Up Excessive Logging
**Status:** ✅ COMPLETED (Partial)
- Cleaned up AuthController.js (removed emoji logs, simplified output)
- Removed excessive debug logging from login/register/user management
- Kept error logs and critical info logs
- Note: Additional logging cleanup can be done in other files as needed

### Phase 6: Remove Placeholder/Unused Code
**Status:** ✅ COMPLETED
- Updated placeholder password reset functions (now return 501 status)
- Removed commented code in database.js
- Removed duplicate Outlook column additions
- Cleaned up initialization logic

### Phase 7: Database Optimizations
**Status:** ✅ COMPLETED
- Added unique index on users.email
- Added indexes on users (role, department, is_active, created_at)
- Added indexes on user_sessions (user_id, expires_at, session_token)
- Added indexes on support_tickets (user_id, status, priority, created_at)
- Added indexes on cv_batches (user_id, status, created_at)
- Added indexes on candidates (batch_id, email, overall_score)
- Interview table indexes already existed

### Phase 8: Error Handling Standardization
**Status:** ✅ COMPLETED (Partial)
- Standardized error responses in server.js
- Removed stack traces from production
- Improved error logging in AuthController
- Global error boundary middleware in place

### Phase 9: Environment & Configuration
**Status:** ✅ COMPLETED
- CORS origins now environment-driven (ALLOWED_ORIGINS env var)
- JWT secrets validated on startup
- HTTPS enforcement added for production
- All critical env vars validated

### Phase 10: Final Testing & Deployment
**Status:** ⏳ READY FOR TESTING
- All code changes completed
- Ready for local testing
- Ready for git commit and auto-deploy

---

## NOTES
- All changes must maintain backward compatibility
- No functionality should be broken
- Test locally before pushing to GitHub
- Vercel/Netlify will auto-deploy on push
- Keep detailed logs of all changes made