# 🚀 Deployment Guide - Production Update

## 📋 Overview

This guide covers deploying the latest changes to production, including:
- UI improvements (button spacing, text visibility, balance labels)
- Fixed owner/borrower count display
- New BookDetailScreen with all action buttons
- Favorite books feature
- Single-line compact dashboard cards

**Commit:** `902fe78` - "feat: UI improvements and favorite books feature"

---

## ✅ Changes Pushed to Repository

```bash
git commit -m "feat: UI improvements and favorite books feature"
git push origin main
```

**Repository:** https://github.com/satux14/thavanai_app.git  
**Branch:** `main`

---

## 🔄 Deployment Steps

### **Step 1: Pull Latest Changes on Production Server**

```bash
# SSH into your production server
ssh user@your-production-server

# Navigate to app directory
cd /path/to/thavanai_mobile

# Pull latest changes
git pull origin main

# Verify you're on the right commit
git log --oneline -1
# Should show: 902fe78 feat: UI improvements and favorite books feature
```

---

### **Step 2: Install Dependencies (If Any New Packages)**

```bash
# Install any new npm packages
npm install

# Server dependencies
cd server
npm install
cd ..
```

---

### **Step 3: Run Database Migration**

This adds the `is_favorite` field to the books table.

```bash
# Navigate to server directory
cd server

# Run the migration
node src/db/migrate-favorites.js
```

**Expected Output:**
```
✅ Favorite books migration completed successfully!
```

**What This Does:**
- Adds `is_favorite INTEGER DEFAULT 0` column to `books` table
- Creates index `idx_books_favorite` for faster sorting
- All existing books will have `is_favorite = 0` (not favorited)

---

### **Step 4: Restart Backend Server**

```bash
# If using PM2
pm2 restart thavanai-server

# OR if using npm directly
cd server
npm start

# OR if using systemd
sudo systemctl restart thavanai-server
```

**Verify Server is Running:**
```bash
# Check server logs
pm2 logs thavanai-server

# OR
curl http://localhost:3000/health
```

---

### **Step 5: Rebuild Mobile App**

#### **For Development/Testing:**
```bash
# Clear cache and rebuild
npx expo start --clear

# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

#### **For Production Build:**

**Android:**
```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

**iOS:**
```bash
# Build for TestFlight/App Store
eas build --platform ios --profile production
```

---

## 🗂️ Files Changed in This Deployment

### **Frontend Files:**
1. ✅ `src/screens/DashboardScreen.js` - Single-line cards, UI fixes, favorite sorting
2. ✅ `src/screens/BookDetailScreen.js` - **NEW FILE** - Full book detail view
3. ✅ `App.js` - Added BookDetailScreen navigation
4. ✅ `src/utils/storage.js` - Added toggleFavoriteBook function
5. ✅ `src/services/api.js` - Added toggleFavorite API method
6. ✅ `src/utils/i18n.js` - Added favorite translations
7. ✅ `eas.json` - Build configurations

### **Backend Files:**
8. ✅ `server/src/routes/books.js` - Added PATCH /books/:id/favorite endpoint
9. ✅ `server/src/db/add-favorite-books.sql` - Database migration
10. ✅ `server/src/db/migrate-favorites.js` - Migration runner

### **Documentation:**
11. ✅ `DASHBOARD_OPTIMIZATION.md`
12. ✅ `SINGLE_LINE_CARD_DESIGN.md`
13. ✅ `VISUAL_COMPARISON.md`
14. ✅ `UI_AND_FEATURES_UPDATE.md`
15. ✅ `IOS_PHYSICAL_DEVICE_TESTING.md`

---

## 🔍 Verification Checklist

After deployment, verify these features work:

### **1. Dashboard UI Fixes:**
- [ ] + button has proper spacing (not overlapping border)
- [ ] + button has rounded corners
- [ ] Loan amount has green badge background
- [ ] Balance has blue badge background
- [ ] Balance shows "Balance: ₹1700" label
- [ ] Owner count shows filtered results
- [ ] Borrower count shows filtered results

### **2. BookDetailScreen:**
- [ ] Tapping a book card opens BookDetailScreen
- [ ] All action buttons are visible:
  - [ ] ➕ Add Entry (top button)
  - [ ] 📖 View Entries
  - [ ] 📄 PDF Download
  - [ ] ⭐ Favorite (owner only)
  - [ ] ✏️ Edit (owner only)
  - [ ] 🤝 Share (owner only)
  - [ ] 👥 View Shared (owner only)
  - [ ] 🔒 Close / 🔓 Reopen (owner only)
  - [ ] 🗑️ Delete (owner only)

### **3. Favorite Feature:**
- [ ] Can toggle favorite in BookDetailScreen
- [ ] Star changes from ☆ to ⭐
- [ ] Success message appears
- [ ] Dashboard shows ⭐ star next to favorite book name
- [ ] Favorite books appear at top of dashboard
- [ ] Un-favoriting works
- [ ] Favorite status persists after app restart

### **4. Navigation:**
- [ ] Dashboard → Tap card → Opens BookDetailScreen
- [ ] Dashboard → Tap + button → Opens Entries screen
- [ ] BookDetailScreen → All buttons work correctly

---

## 🐛 Troubleshooting

### **Issue: Buttons Not Showing in BookDetailScreen**

**Symptom:** Only "View Entries" and "PDF Download" buttons visible

**Cause:** The `isOwned` property is not being set correctly

**Fix:**
1. Check `src/screens/BookDetailScreen.js` line 58:
```javascript
const isOwned = bookData.owner_id === user?.id || bookData.isOwned === true;
```

2. Verify the backend is returning `owner_id` in the book response

3. Clear app cache and rebuild:
```bash
npx expo start --clear
```

---

### **Issue: Migration Already Run**

**Symptom:** Error when running migration: "column already exists"

**Solution:** This is safe to ignore. The migration uses `IF NOT EXISTS` so it won't fail if the column already exists.

---

### **Issue: Favorite Not Persisting**

**Symptom:** Favorite status resets after app restart

**Possible Causes:**
1. Database migration not run
2. Cache not invalidated

**Fix:**
```bash
# Run migration
cd server
node src/db/migrate-favorites.js

# Restart server
pm2 restart thavanai-server

# Clear app cache
npx expo start --clear
```

---

### **Issue: Server Not Starting**

**Symptom:** Server crashes or won't start

**Check:**
```bash
# View server logs
pm2 logs thavanai-server

# Check for port conflicts
lsof -i :3000

# Check database file permissions
ls -la server/database.sqlite
```

---

## 📊 Database Schema Changes

### **Before Migration:**
```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  owner_id INTEGER,
  name TEXT,
  dlNo TEXT,
  loanAmount REAL,
  status TEXT,
  -- ... other fields
  updated_at TEXT
);
```

### **After Migration:**
```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  owner_id INTEGER,
  name TEXT,
  dlNo TEXT,
  loanAmount REAL,
  status TEXT,
  is_favorite INTEGER DEFAULT 0,  -- NEW FIELD
  -- ... other fields
  updated_at TEXT
);

-- NEW INDEX
CREATE INDEX idx_books_favorite ON books (is_favorite DESC, updated_at DESC);
```

---

## 🔐 API Changes

### **New Endpoint: Toggle Favorite**

**Request:**
```http
PATCH /api/books/:id/favorite
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_favorite": 1
}
```

**Response:**
```json
{
  "message": "Favorite status updated successfully",
  "is_favorite": 1
}
```

**Errors:**
- `404` - Book not found
- `403` - Can only favorite your own books
- `500` - Failed to update favorite status

---

## 🚦 Rollback Plan

If something goes wrong, here's how to rollback:

### **1. Rollback Code:**
```bash
# Get the previous commit hash
git log --oneline -5

# Rollback to previous commit (replace with actual hash)
git reset --hard 909e98a

# Force push (BE CAREFUL)
git push origin main --force
```

### **2. Rollback Database:**

The `is_favorite` field won't affect existing functionality, so you can leave it. But if needed:

```sql
-- Remove the favorite field
ALTER TABLE books DROP COLUMN is_favorite;

-- Remove the index
DROP INDEX IF EXISTS idx_books_favorite;
```

### **3. Restart Services:**
```bash
pm2 restart thavanai-server
```

---

## 📱 User Impact

### **What Users Will See:**

**Immediate Changes:**
1. ✅ Cleaner dashboard with single-line cards
2. ✅ Better text visibility with colored badges
3. ✅ Accurate filtered book counts
4. ✅ New "Book Details" screen when tapping a card
5. ✅ All action buttons available in Book Details

**New Feature:**
6. ✅ Favorite star button to mark important books
7. ✅ Favorite books always appear at top of list

**No Breaking Changes:**
- All existing functionality preserved
- No data loss
- Backward compatible

---

## 🎯 Success Metrics

After deployment, monitor:

1. **Server Health:**
   - API response times
   - Error rates
   - Database query performance

2. **User Engagement:**
   - Number of books favorited
   - Dashboard interaction patterns
   - Book detail page views

3. **Performance:**
   - App load time
   - Dashboard scroll performance
   - API latency

---

## 📞 Support

If issues arise:

1. **Check Logs:**
   ```bash
   pm2 logs thavanai-server
   ```

2. **Check Database:**
   ```bash
   sqlite3 server/database.sqlite
   .schema books
   SELECT * FROM books LIMIT 1;
   ```

3. **Verify Migration:**
   ```bash
   sqlite3 server/database.sqlite
   PRAGMA table_info(books);
   # Should show is_favorite column
   ```

4. **Contact:**
   - Repository: https://github.com/satux14/thavanai_app.git
   - Issues: Create a GitHub issue with logs

---

## ✅ Post-Deployment Tasks

After successful deployment:

- [ ] Run verification checklist
- [ ] Test favorite feature with real user account
- [ ] Monitor server logs for errors (first 30 minutes)
- [ ] Test on both iOS and Android devices
- [ ] Verify production database has `is_favorite` column
- [ ] Update team/users about new features
- [ ] Document any production-specific issues

---

## 🎉 Summary

**Deployment Checklist:**
1. ✅ Pull latest code: `git pull origin main`
2. ✅ Run migration: `node server/src/db/migrate-favorites.js`
3. ✅ Restart server: `pm2 restart thavanai-server`
4. ✅ Rebuild mobile app: `eas build` or `npx expo run`
5. ✅ Verify all features working
6. ✅ Monitor logs for issues

**Key Files to Deploy:**
- `src/screens/BookDetailScreen.js` (NEW - critical for buttons!)
- `server/src/db/add-favorite-books.sql` (migration)
- All other modified files

**Database Changes:**
- Adds `is_favorite` column to `books` table
- Creates index for faster sorting

---

## 🔗 Quick Commands

```bash
# Complete deployment (run in order)
git pull origin main
cd server && node src/db/migrate-favorites.js
pm2 restart thavanai-server
cd .. && npx expo start --clear

# Verify deployment
git log --oneline -1
pm2 status
curl http://localhost:3000/health
```

---

**Ready for Production! 🚀**

All changes are committed and pushed. Follow the steps above to deploy to your production environment.

