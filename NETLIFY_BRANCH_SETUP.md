# 🔧 Netlify Branch Configuration - Fix Guide

**Date:** October 21, 2025  
**Issue:** Test branch changes appearing on production  
**Solution:** Proper branch deploy configuration  

---

## 🚨 The Problem

**Current Issue:**
- Pushing to `test` branch deploys to production URL
- No separation between test and production
- Changes meant for testing go live immediately

**Why This Happens:**
- Netlify "Auto publishing" is on for all branches
- No branch-specific deploy contexts configured
- Both branches deploy to same production URL

---

## ✅ The Solution

### **Step 1: Update netlify.toml (DONE)**

I've updated `frontend/netlify.toml` with proper contexts:

```toml
# Production context (main branch only)
[context.production]
  - Deploys to: https://thesimpleai.netlify.app
  - Environment: production
  - Auto-deploy: YES

# Test context (test branch only)  
[context.test]
  - Deploys to: https://test--thesimpleai.netlify.app
  - Environment: development
  - Auto-deploy: YES (but to preview URL only)

# Other branches
[context.branch-deploy]
  - Deploys to: https://[branch]--thesimpleai.netlify.app
  - Preview only
```

---

### **Step 2: Configure Netlify Dashboard**

**Go to Netlify:** https://app.netlify.com/sites/thesimpleai/settings/deploys

#### **2.1 Production Branch**
1. Click "Deploy settings"
2. Find "Production branch"
3. Set to: `main`
4. Save

#### **2.2 Branch Deploys**
1. Scroll to "Branch deploys"
2. Select: "Let me add individual branches"
3. Add branch: `test`
4. This creates preview URL for test branch
5. Save

#### **2.3 Deploy Contexts**
1. Scroll to "Deploy contexts"
2. Production branch: `main`
3. Branch deploys: `test` (and any others you want)
4. Deploy previews: Enable for pull requests
5. Save

---

## 🎯 Expected Behavior After Fix

### **Main Branch (Production):**
```
Branch: main
URL: https://thesimpleai.netlify.app
Auto-deploy: YES
When: git push origin main
Purpose: Live production site
```

### **Test Branch (Preview):**
```
Branch: test
URL: https://test--thesimpleai.netlify.app
Auto-deploy: YES
When: git push origin test
Purpose: Testing before production
```

### **Other Branches:**
```
Branch: feature-xyz
URL: https://feature-xyz--thesimpleai.netlify.app
Auto-deploy: YES
When: git push origin feature-xyz
Purpose: Feature testing
```

---

## 📋 Verification Steps

### **Step 1: Commit the Config**
```bash
git add frontend/netlify.toml
git commit -m "fix: configure proper branch deploy contexts"
git push origin test
```

### **Step 2: Check Netlify Dashboard**
1. Go to Netlify deploys page
2. Look for: "Branch Deploy: test@[commit]"
3. Should say "Published" with preview URL
4. Production URL should NOT change

### **Step 3: Verify URLs**

**Production (should be unchanged):**
```
https://thesimpleai.netlify.app
- Should show main branch code
- No test banner
- Clean production version
```

**Test Preview (should have test changes):**
```
https://test--thesimpleai.netlify.app
- Should show test branch code
- Orange test banner visible
- All test changes present
```

---

## 🔒 Lock Down Production

### **Additional Safety Measures:**

#### **1. Stop Auto Publishing (Optional)**
If you want manual control:
1. Go to Deploy settings
2. Find "Auto publishing"
3. Click "Lock to stop auto publishing"
4. Now deploys require manual trigger

#### **2. Add Deploy Notifications**
Get notified when production deploys:
1. Go to Settings → Build & deploy → Deploy notifications
2. Add notification for production deploys
3. Choose: Email, Slack, or webhook

#### **3. Protected Branches (GitHub)**
Protect main branch from accidental pushes:
1. Go to GitHub repo settings
2. Branches → Add rule
3. Branch name: `main`
4. Enable: "Require pull request before merging"
5. Enable: "Require status checks to pass"
6. Save

---

## 🚀 Proper Workflow Going Forward

### **Development Workflow:**

#### **1. Make Changes on Test Branch**
```bash
git checkout test
# Make your changes
git add .
git commit -m "feat: new feature"
git push origin test
```

**Result:**
- ✅ Deploys to test preview URL
- ❌ Does NOT affect production
- ✅ You can test safely

#### **2. Test on Preview URL**
```bash
# Visit test preview
https://test--thesimpleai.netlify.app

# Test everything:
- Login works
- Features work
- No errors
```

#### **3. Merge to Production When Ready**
```bash
# Switch to main
git checkout main

# Merge test branch
git merge test

# Push to production
git push origin main
```

**Result:**
- ✅ Deploys to production URL
- ✅ Changes go live
- ✅ Test branch unchanged

---

## 🐛 Troubleshooting

### **Issue: Test changes still appearing on production**

**Check:**
1. Which branch is set as production in Netlify?
2. Is auto-publishing locked?
3. Did you push to main by accident?

**Fix:**
```bash
# Check current branch
git branch

# If on main, switch to test
git checkout test

# Verify production branch in Netlify settings
```

---

### **Issue: Preview URL not working**

**Check:**
1. Is test branch added in Netlify branch deploys?
2. Did the deploy succeed?
3. Is there a build error?

**Fix:**
1. Go to Netlify → Deploy settings
2. Add `test` to branch deploys
3. Trigger manual deploy if needed

---

### **Issue: Both URLs show same content**

**Reason:** Browser cache

**Fix:**
```
Hard refresh both URLs:
- Mac: Cmd + Shift + R
- Windows: Ctrl + Shift + R
- Or use incognito mode
```

---

## 📊 Quick Reference

### **URLs:**
| Environment | Branch | URL |
|-------------|--------|-----|
| Production | main | https://thesimpleai.netlify.app |
| Test | test | https://test--thesimpleai.netlify.app |
| Feature | feature-x | https://feature-x--thesimpleai.netlify.app |

### **Commands:**
```bash
# Work on test
git checkout test
git push origin test  # → test preview URL

# Deploy to production
git checkout main
git merge test
git push origin main  # → production URL

# Check current branch
git branch

# Check remote branches
git branch -r
```

---

## ✅ Checklist

Before considering this fixed, verify:

- [ ] netlify.toml updated with contexts
- [ ] Netlify production branch set to `main`
- [ ] Netlify branch deploys includes `test`
- [ ] Test push goes to preview URL only
- [ ] Production URL unchanged by test pushes
- [ ] Can merge test → main successfully
- [ ] Production deploys only from main

---

## 🎯 Next Steps

1. **Commit the netlify.toml changes**
2. **Configure Netlify dashboard settings**
3. **Test the workflow**
4. **Verify separation is working**
5. **Document for team**

---

**Once this is set up correctly, you'll have:**
- ✅ Safe testing environment
- ✅ Protected production
- ✅ Clear separation
- ✅ Confidence in deployments

**Ready to commit these changes?**
