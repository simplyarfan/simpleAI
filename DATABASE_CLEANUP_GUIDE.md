# 🔧 Database Cleanup Guide

**Date:** October 16, 2025  
**Purpose:** Fix ticket comments with invalid ticket_id values

---

## 🚨 **Problem**

Some comments in the `ticket_comments` table have invalid `ticket_id` values (e.g., `ticket_id = 0` or `NULL`). This causes:
- Backend returns only 30 comments when database has 47
- Comments not showing up for their respective tickets
- Inconsistent data display

---

## ✅ **Solution**

Run the automated cleanup script that will:
1. Find all comments with invalid `ticket_id`
2. Attempt to auto-fix by matching `user_id` to tickets
3. Report any comments that need manual review
4. Show statistics before and after

---

## 🚀 **How to Run the Cleanup Script**

### **Option 1: From Backend Directory (Recommended)**

```bash
cd backend
node scripts/fix-ticket-comments.js
```

### **Option 2: From Project Root**

```bash
node backend/scripts/fix-ticket-comments.js
```

---

## 📊 **What the Script Does**

### **Step 1: Find Invalid Comments**
```
📊 Finding comments with invalid ticket_id...
Found 3 comments with invalid ticket_id

❌ Invalid Comments:
  ID: 46 | ticket_id: 0 | User: user@example.com | Comment: "hi..."
  ID: 52 | ticket_id: 0 | User: user@example.com | Comment: "test..."
  ID: 58 | ticket_id: NULL | User: admin@example.com | Comment: "response..."
```

### **Step 2: Auto-Fix Comments**
The script will:
- Match comments to tickets by `user_id`
- If user has only 1 ticket → auto-assign comment to that ticket
- If user has multiple tickets → flag for manual review
- If user has no tickets → flag as orphaned

```
🔄 Attempting to auto-fix comments...
✅ Fixed comment 46 → assigned to ticket 6 (Login Issue)
✅ Fixed comment 52 → assigned to ticket 6 (Login Issue)
⚠️  Comment 58 - User has 3 tickets, manual review needed:
     - Ticket 5: Bug Report
     - Ticket 6: Login Issue
     - Ticket 7: Feature Request
```

### **Step 3: Show Statistics**
```
📊 Final Statistics:

Remaining invalid comments: 1

Top 10 tickets with comment counts:
  Ticket 6: 32 comments - "Login Issue"
  Ticket 5: 8 comments - "Bug Report"
  Ticket 7: 5 comments - "Feature Request"
  ...

✅ Cleanup complete!
```

---

## 🔍 **Manual Review (If Needed)**

If the script can't auto-fix some comments, you'll need to manually assign them:

### **Find the Comment**
```sql
SELECT id, ticket_id, user_id, comment, created_at 
FROM ticket_comments 
WHERE id = 58;
```

### **Find User's Tickets**
```sql
SELECT id, subject, created_at 
FROM support_tickets 
WHERE user_id = (SELECT user_id FROM ticket_comments WHERE id = 58)
ORDER BY created_at DESC;
```

### **Assign to Correct Ticket**
```sql
-- Replace 6 with the correct ticket_id
UPDATE ticket_comments 
SET ticket_id = 6 
WHERE id = 58;
```

---

## 🛡️ **Prevent Future Issues**

The script is safe to run multiple times. After cleanup, consider:

### **Add Database Constraint**
```sql
-- Ensure ticket_id is never 0 or NULL
ALTER TABLE ticket_comments 
ADD CONSTRAINT ticket_comments_ticket_id_check 
CHECK (ticket_id > 0);

-- Ensure ticket_id references valid ticket
ALTER TABLE ticket_comments 
ADD CONSTRAINT ticket_comments_ticket_id_fkey 
FOREIGN KEY (ticket_id) 
REFERENCES support_tickets(id) 
ON DELETE CASCADE;
```

---

## 📝 **Expected Results**

### **Before Cleanup:**
```
Total comments in DB: 47
Comments with valid ticket_id: 30
Comments with invalid ticket_id: 17
Backend returns: 30 comments
```

### **After Cleanup:**
```
Total comments in DB: 47
Comments with valid ticket_id: 47
Comments with invalid ticket_id: 0
Backend returns: 47 comments ✅
```

---

## 🚨 **Troubleshooting**

### **Error: Cannot find module '../models/database'**
```bash
# Make sure you're in the backend directory
cd backend
node scripts/fix-ticket-comments.js
```

### **Error: Connection refused**
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# If not set, add to .env file
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### **Error: Permission denied**
```bash
# Make script executable
chmod +x scripts/fix-ticket-comments.js
```

---

## ✅ **Verification**

After running the script, verify the fix:

### **1. Check Database**
```sql
-- Should return 0
SELECT COUNT(*) FROM ticket_comments WHERE ticket_id = 0 OR ticket_id IS NULL;

-- Should return all comments
SELECT COUNT(*) FROM ticket_comments WHERE ticket_id > 0;
```

### **2. Test Frontend**
1. Go to a ticket page
2. Add a new comment
3. Comment should appear immediately
4. Reload page
5. All comments should still be visible

### **3. Check Backend Logs**
```
🔍 [SUPPORT] Fetching comments for ticket 6
📊 [SUPPORT] Ticket 6 - Found 32 comments
📝 [SUPPORT] Comment IDs: [15, 17, 18, ..., 46, 47]
```

---

## 📊 **Summary**

| Task | Status | Time |
|------|--------|------|
| Run cleanup script | ⏳ Pending | 2 min |
| Review manual fixes | ⏳ Pending | 5 min |
| Add database constraints | ⏳ Pending | 3 min |
| Verify fixes | ⏳ Pending | 5 min |
| **Total** | | **15 min** |

---

## 🎯 **Next Steps**

1. ✅ Run the cleanup script
2. ✅ Review any manual fixes needed
3. ✅ Add database constraints
4. ✅ Test ticketing system
5. ✅ Deploy to production

---

**After cleanup, your ticketing system will be 100% functional!** 🚀
