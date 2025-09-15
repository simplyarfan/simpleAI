# 🗄️ VERCEL ENVIRONMENT VARIABLES SETUP

## Required Environment Variables for Vercel Deployment

Go to your Vercel project settings → Environment Variables and add these:

### Database Configuration
```
DATABASE_URL=postgresql://neondb_owner:npg_U7DVSnPM9Bmr@ep-sweet-dust-adc4jjkh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_URL=postgresql://neondb_owner:npg_U7DVSnPM9Bmr@ep-sweet-dust-adc4jjkh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_U7DVSnPM9Bmr@ep-sweet-dust-adc4jjkh.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### JWT Configuration (CRITICAL - CHANGE THESE!)
```
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long_change_now_prod_2024
REFRESH_TOKEN_SECRET=your_super_secure_refresh_token_secret_at_least_32_characters_long_change_now_prod_2024
JWT_EXPIRES_IN=7d
```

### Application Configuration
```
NODE_ENV=production
ADMIN_EMAIL=syedarfan@securemaxtech.com
COMPANY_DOMAIN=securemaxtech.com
FRONTEND_URL=https://thesimpleai.netlify.app
```

### Email Configuration (Optional - for notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@securemaxtech.com
EMAIL_PASS=your_gmail_app_password
```

### Security & Performance
```
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=10485760
CORS_ORIGINS=https://thesimpleai.netlify.app,https://thesimpleai.vercel.app
```

## 🚀 Deployment Steps

1. **Set Environment Variables in Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project (thesimpleai)
   - Go to Settings → Environment Variables
   - Add each variable above

2. **Redeploy:**
   - The push to GitHub will automatically trigger a new deployment
   - Monitor the deployment logs in Vercel dashboard

3. **Verify Deployment:**
   - Check https://thesimpleai.vercel.app/health
   - Should show database: "connected"
   - Check https://thesimpleai.vercel.app/api for API documentation

## 🔧 Database Schema

The application will automatically create these tables on first connection:
- users (authentication and profiles)
- user_sessions (JWT session management)
- user_preferences (user settings)
- user_analytics (activity tracking)
- agent_usage_stats (AI agent usage)
- cv_batches (CV processing batches)
- cv_candidates (CV analysis results)
- support_tickets (support system)
- ticket_comments (support comments)
- system_settings (application settings)

## 🔐 Default Admin Account

After deployment, a default admin will be created:
- Email: syedarfan@securemaxtech.com
- Password: AdminPassword123!
- **IMPORTANT: Change this password immediately after first login!**

## 🧪 Testing

After setting up the environment variables:

1. Test the API endpoints:
   ```
   GET https://thesimpleai.vercel.app/health
   GET https://thesimpleai.vercel.app/api
   POST https://thesimpleai.vercel.app/api/auth/login
   ```

2. Test the frontend:
   ```
   https://thesimpleai.netlify.app
   ```

## 🚨 Security Notes

1. **Change JWT secrets immediately** - use strong, unique values
2. **Change default admin password** after first login
3. **Review CORS origins** to ensure only your domains are allowed
4. **Monitor database usage** in Neon dashboard
5. **Set up email notifications** for production monitoring

## 📊 Monitoring

- **Vercel Functions**: Monitor function invocations and errors
- **Neon Database**: Monitor connection count and query performance
- **Application Logs**: Check Vercel function logs for any issues

The integration is now complete and ready for production use!
