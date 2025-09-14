# Enterprise AI Hub - Complete Deployment Guide

## Current Live URLs
- **Frontend**: https://thesimpleai.netlify.app
- **Backend**: https://thesimpleai-ho69jpj8z-syed-arfan-hussains-projects.vercel.app
- **GitHub**: https://github.com/simplyarfan/simpleAI

## Fixed Issues in Latest Deployment

### Critical Fixes Applied:
1. **JWT Import Fixed**: Changed from `{ jwtDecode }` to `jwtDecode` for v3 compatibility
2. **CORS Updated**: Added new Netlify URL `thesimpleai.netlify.app` to backend CORS origins
3. **API Paths Fixed**: Resolved double `/api/api/` path issue in frontend
4. **Environment Variables**: Updated all configs to point to correct backend URL
5. **Clean Codebase**: Removed unused files and cleaned up configurations

### Backend Configuration:
```
URL: https://thesimpleai-ho69jpj8z-syed-arfan-hussains-projects.vercel.app
Version: 1.0.3
Database: SQLite in-memory (Vercel compatible)
CORS: Allows thesimpleai.netlify.app
```

### Frontend Configuration:
```
URL: https://thesimpleai.netlify.app
Framework: Next.js with static export
Build: npm run build
Output: out/ directory
API Endpoint: Vercel backend
```

## Environment Variables

### Vercel Backend:
```
JWT_SECRET=your_secure_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_USER=syedarfan@securemaxtech.com
EMAIL_PASS=your_gmail_app_password
COMPANY_DOMAIN=securemaxtech.com
ADMIN_EMAIL=syedarfan@securemaxtech.com
FRONTEND_URL=https://thesimpleai.netlify.app
NODE_ENV=production
```

### Netlify Frontend:
```
NEXT_PUBLIC_API_URL=https://thesimpleai-ho69jpj8z-syed-arfan-hussains-projects.vercel.app
NEXT_PUBLIC_APP_NAME=Enterprise AI Hub
NEXT_PUBLIC_COMPANY_DOMAIN=securemaxtech.com
```

## Deployment Status
- ✅ Backend: Live and healthy
- ✅ Frontend: JWT import issue resolved
- ✅ CORS: Updated for new domain
- ✅ API Connectivity: Fixed double path issue
- ✅ Authentication: Ready to test

## Testing Checklist
1. Visit https://thesimpleai.netlify.app
2. Check console for errors (should be clean)
3. Click "Create Account" - should see API calls in Network tab
4. Register with @securemaxtech.com email
5. Backend logs should show incoming requests

## Admin Access
- Email: syedarfan@securemaxtech.com
- Default password set during database initialization
- Change password immediately after first login

---
Last Updated: September 14, 2025
Status: Ready for production testing