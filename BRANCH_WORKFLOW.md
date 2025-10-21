# 🌿 Branch Workflow Guide

## Branch Structure

```
main (production)
  ├── Deploys to: thesimpleai.netlify.app (frontend)
  ├── Deploys to: thesimpleai.vercel.app (backend)
  └── Protected: Only merge from test after verification

test (development)
  ├── Deploys to: test preview URLs (Netlify/Vercel)
  ├── All new changes go here first
  └── Merge to main only when verified working
```

---

## 🚀 Daily Workflow

### 1. Starting New Work

```bash
# Make sure you're on test branch
git checkout test

# Get latest changes
git pull origin test

# Start working on your changes
```

### 2. Making Changes

```bash
# Make your code changes
# ... edit files ...

# Test locally
cd backend && npm run dev
cd frontend && npm run dev

# If tests pass, commit
git add .
git commit -m "descriptive message about what you changed"
git push origin test
```

### 3. Testing on Test Branch

```bash
# After pushing to test branch:
# 1. Check Netlify deploy preview (you'll get a URL like: test--thesimpleai.netlify.app)
# 2. Check Vercel deploy preview (you'll get a URL in Vercel dashboard)
# 3. Test all functionality thoroughly
# 4. Check for errors in browser console
# 5. Test on mobile if needed
```

### 4. Merging to Production (Main)

```bash
# Only when test branch is fully verified and working:

# Switch to main branch
git checkout main

# Pull latest main
git pull origin main

# Merge test into main
git merge test

# Push to production
git push origin main

# Switch back to test for next changes
git checkout test
```

---

## 📋 Quick Commands Reference

### Check which branch you're on:
```bash
git branch
# * indicates current branch
```

### Switch branches:
```bash
git checkout test    # Switch to test
git checkout main    # Switch to main
```

### See what changed:
```bash
git status           # See modified files
git diff             # See actual changes
```

### Undo changes (before commit):
```bash
git restore filename.js    # Undo changes to one file
git restore .              # Undo all changes
```

### View commit history:
```bash
git log --oneline -10      # Last 10 commits
```

---

## 🎯 Best Practices

### ✅ DO:
- Always work on `test` branch
- Test locally before pushing
- Test on preview URLs before merging to main
- Write clear commit messages
- Commit small, logical changes
- Pull before starting new work

### ❌ DON'T:
- Don't push directly to main (unless emergency fix)
- Don't commit without testing
- Don't merge to main with known bugs
- Don't commit sensitive data (API keys, passwords)
- Don't commit node_modules or build files

---

## 🔧 Common Scenarios

### Scenario 1: Made changes on wrong branch (main instead of test)

```bash
# Don't panic! Save your changes:
git stash

# Switch to test branch
git checkout test

# Apply your changes
git stash pop

# Now commit on test branch
git add .
git commit -m "your message"
git push origin test
```

### Scenario 2: Need to fix urgent bug on production

```bash
# Switch to main
git checkout main

# Make the fix
# ... edit files ...

# Commit and push
git add .
git commit -m "hotfix: description of urgent fix"
git push origin main

# Merge fix back to test so it doesn't get lost
git checkout test
git merge main
git push origin test
```

### Scenario 3: Test branch is broken, need to start over

```bash
# Reset test to match main
git checkout test
git reset --hard origin/main
git push origin test --force

# ⚠️ WARNING: This deletes all changes on test branch!
```

### Scenario 4: Want to see what's different between test and main

```bash
git diff main..test
```

---

## 🚨 Emergency Commands

### Undo last commit (before push):
```bash
git reset --soft HEAD~1
# Your changes are still there, just uncommitted
```

### Undo last commit (after push):
```bash
git revert HEAD
git push origin test
# Creates a new commit that undoes the last one
```

### Discard ALL local changes:
```bash
git reset --hard HEAD
# ⚠️ WARNING: This deletes all uncommitted changes!
```

---

## 📊 Current Branch Status

### Main Branch (Production)
- **Status**: Protected
- **Deploys to**: Live production sites
- **Last updated**: Check with `git log origin/main -1`

### Test Branch (Development)
- **Status**: Active development
- **Deploys to**: Preview URLs
- **Last updated**: Check with `git log origin/test -1`

---

## 🎓 Learning Resources

### Understanding Git:
- `git status` - Your best friend, use it often
- `git log` - See history of changes
- `git diff` - See what changed
- `git branch` - See all branches

### Commit Message Format:
```
type: brief description

Examples:
feat: add user authentication
fix: resolve login bug
docs: update README
style: format code
refactor: reorganize components
test: add unit tests
chore: update dependencies
```

---

## 📞 When Things Go Wrong

### "I'm confused about which branch I'm on"
```bash
git branch
# The one with * is your current branch
```

### "I have merge conflicts"
```bash
# Git will mark conflicts in files like:
<<<<<<< HEAD
your changes
=======
conflicting changes
>>>>>>> test

# Edit the file, remove the markers, keep what you want
# Then:
git add filename.js
git commit -m "resolved merge conflict"
```

### "I pushed something bad to test"
```bash
# Revert the commit
git revert HEAD
git push origin test
```

### "I accidentally pushed to main"
```bash
# Contact me immediately - we'll fix it together
# Don't try to force push to main
```

---

## ✅ Checklist Before Merging to Main

- [ ] All changes tested locally
- [ ] No console errors
- [ ] Preview deployment works correctly
- [ ] All features function as expected
- [ ] No breaking changes
- [ ] Code is clean and commented
- [ ] Commit messages are clear
- [ ] Ready for production

---

## 🎯 Summary

**Simple Rule**: 
1. Work on `test` branch
2. Test everything
3. Merge to `main` when verified
4. Repeat

**Remember**: 
- `test` = safe to experiment
- `main` = production, be careful

---

**Created**: October 21, 2025
**Last Updated**: October 21, 2025
