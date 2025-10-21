# 🧪 Testing Checklist for Test Branch

## Current Changes on Test Branch
- ✅ Security headers (helmet)
- ✅ Enhanced logging (Winston)
- ✅ Security event monitoring
- ✅ Request/response timing
- ✅ Suspicious activity detection

---

## 📋 Pre-Deployment Testing

### 1. Local Testing (REQUIRED)

#### Backend Testing:
```bash
cd backend
npm install
npm run dev
```

**Check for:**
- [ ] Server starts without errors
- [ ] No missing dependency errors
- [ ] Logs directory created automatically
- [ ] Security headers logged on startup
- [ ] Database connection successful

#### Frontend Testing:
```bash
cd frontend
npm run dev
```

**Check for:**
- [ ] Frontend starts without errors
- [ ] Can access login page
- [ ] No console errors in browser

---

### 2. API Testing

#### Test Authentication:
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"syedarfan@securemaxtech.com","password":"your_password"}'
```

**Expected:**
- [ ] Returns JWT token
- [ ] No CORS errors
- [ ] Security headers present in response
- [ ] Request logged in backend console

#### Test Protected Endpoint:
```bash
# Test with valid token
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:**
- [ ] Returns user profile
- [ ] No authentication errors
- [ ] Request logged with timing

---

### 3. Security Testing

#### Test Rate Limiting:
```bash
# Run this 6 times quickly
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

**Expected:**
- [ ] First 5 attempts go through
- [ ] 6th attempt returns 429 (Too Many Requests)
- [ ] Rate limit message displayed

#### Test CORS:
```bash
# Test from unauthorized origin
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Origin: https://evil-site.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- [ ] Request blocked or no CORS headers
- [ ] Security event logged

#### Test Security Headers:
```bash
curl -I http://localhost:5000/health
```

**Expected Headers:**
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Strict-Transport-Security` (in production)

---

### 4. Logging Testing

#### Check Log Files:
```bash
cd backend/logs
ls -la
```

**Expected:**
- [ ] `error.log` exists
- [ ] `combined.log` exists
- [ ] Logs contain timestamps
- [ ] Logs contain request details

#### Check Log Content:
```bash
tail -f backend/logs/combined.log
```

**Make some requests and verify:**
- [ ] Requests are logged
- [ ] Response times are logged
- [ ] Error details are logged
- [ ] Security events are logged

---

### 5. Integration Testing

#### Full User Flow:
1. **Register New User**
   - [ ] Can register with @securemaxtech.com email
   - [ ] Cannot register with other domains
   - [ ] Duplicate email shows error

2. **Login**
   - [ ] Can login with correct credentials
   - [ ] Cannot login with wrong password
   - [ ] Rate limiting works after 5 failed attempts

3. **Access Dashboard**
   - [ ] Dashboard loads correctly
   - [ ] User data displays
   - [ ] No console errors

4. **Create Support Ticket**
   - [ ] Can create ticket
   - [ ] Ticket appears in list
   - [ ] Admin receives notification

5. **CV Intelligence**
   - [ ] Can create batch
   - [ ] Can upload files
   - [ ] Processing works

---

## 🚀 Deployment Testing

### After Pushing to Test Branch:

#### 1. Check Vercel Deployment:
- [ ] Go to Vercel dashboard
- [ ] Check deployment status
- [ ] View deployment logs
- [ ] Check for build errors

#### 2. Check Netlify Deployment:
- [ ] Go to Netlify dashboard
- [ ] Check deployment status
- [ ] View deployment logs
- [ ] Check for build errors

#### 3. Test Preview URLs:

**Backend (Vercel):**
```bash
# Test health endpoint
curl https://thesimpleai.vercel.app/health
```

**Frontend (Netlify):**
- [ ] Visit preview URL
- [ ] Test login
- [ ] Test dashboard
- [ ] Check browser console for errors

---

## 🔍 Verification Checklist

### Before Merging to Main:

#### Functionality:
- [ ] All existing features work
- [ ] No new bugs introduced
- [ ] Performance is acceptable
- [ ] No console errors

#### Security:
- [ ] Security headers present
- [ ] Rate limiting works
- [ ] CORS configured correctly
- [ ] Logging captures security events

#### Code Quality:
- [ ] No syntax errors
- [ ] No missing dependencies
- [ ] Code is clean and commented
- [ ] Commit messages are clear

#### Documentation:
- [ ] Changes documented
- [ ] Testing checklist completed
- [ ] Known issues noted

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'helmet'"
**Solution:**
```bash
cd backend
npm install
```

### Issue: "EACCES: permission denied, mkdir 'logs'"
**Solution:**
```bash
mkdir backend/logs
chmod 755 backend/logs
```

### Issue: "CORS error in browser"
**Solution:**
- Check `backend/middleware/security.js`
- Verify frontend URL is in `allowedOrigins`
- Clear browser cache

### Issue: "Rate limiting not working"
**Solution:**
- Check if rate limiter is applied to route
- Verify IP address is being captured correctly
- Check `req.ip` in logs

---

## 📊 Performance Benchmarks

### Response Times (Target):
- [ ] Health check: < 50ms
- [ ] Login: < 500ms
- [ ] Dashboard load: < 2s
- [ ] API calls: < 1s

### Load Testing:
```bash
# Install Apache Bench
brew install apache-bench

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:5000/health
```

**Expected:**
- [ ] 0% failed requests
- [ ] Average response time < 100ms
- [ ] No memory leaks

---

## ✅ Final Sign-Off

### Tested By: _________________
### Date: _________________
### Environment: [ ] Local [ ] Test [ ] Production

### Test Results:
- [ ] All tests passed
- [ ] No critical issues
- [ ] Ready for merge to main

### Notes:
```
Add any additional notes or observations here
```

---

## 🚀 Merge to Main

### When all tests pass:

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge test branch
git merge test

# Push to production
git push origin main
```

### After Merge:
- [ ] Monitor production logs
- [ ] Check error rates
- [ ] Verify deployments
- [ ] Test critical paths

---

**Remember**: Never merge to main without completing this checklist!
