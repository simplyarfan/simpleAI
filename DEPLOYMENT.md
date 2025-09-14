# Enterprise AI Hub - Deployment Instructions

## 🚀 Quick Deployment Guide

### Frontend to Netlify + Backend to Railway

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

#### Step 2: Deploy Backend (Railway)
1. Go to railway.app
2. "Deploy from GitHub repo"
3. Select your repo
4. Choose "backend" folder
5. Add environment variables:
   - JWT_SECRET=your_secure_secret_here
   - REFRESH_TOKEN_SECRET=your_refresh_secret_here
   - EMAIL_USER=your.email@securemaxtech.com
   - EMAIL_PASS=your_gmail_app_password
   - COMPANY_DOMAIN=securemaxtech.com
   - ADMIN_EMAIL=syedarfan@securemaxtech.com
   - FRONTEND_URL=https://your-netlify-app.netlify.app

#### Step 3: Deploy Frontend (Netlify)
1. Go to netlify.com
2. "New site from Git"
3. Select your repo
4. Base directory: frontend
5. Build command: npm run build
6. Publish directory: .next
7. Add environment variables:
   - NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app/api
   - NEXT_PUBLIC_APP_NAME=Enterprise AI Hub
   - NEXT_PUBLIC_COMPANY_DOMAIN=securemaxtech.com

#### Step 4: Update CORS
Update your backend CORS settings to include your Netlify URL.

### URLs After Deployment
- Frontend: https://your-app-name.netlify.app
- Backend API: https://your-backend.railway.app
- Admin Login: Use the ADMIN_EMAIL you configured

## 🔐 Production Checklist
- [ ] Change JWT secrets to strong random strings
- [ ] Configure Gmail App Password
- [ ] Update CORS origins
- [ ] Test email verification
- [ ] Test file uploads
- [ ] Verify all authentication flows

## 🚨 Important Notes
- The first user with ADMIN_EMAIL becomes superadmin automatically
- Email verification is required for all new users
- File uploads are stored locally (upgrade to S3 for production scale)
- SQLite database persists with Railway's persistent storage
