# 🗄️ Custom Database Path Setup

## Your Database Location: `data/thavanai.db`

All migration scripts have been updated to use the correct database path.

---

## 🚀 Quick Setup Commands (Production)

Run these commands on your production server:

```bash
# Step 1: Pull latest code (includes the fixed migration script)
cd ~/Documents/GitHub/thavanai_app
git pull origin main

# Step 2: Navigate to server directory
cd server

# Step 3: Create base database tables
node src/db/migrate.js

# Step 4: Add favorite books feature
node src/db/migrate-favorites.js

# Step 5: (Optional) Add admin feature
node src/db/migrate-admin.js

# Step 6: (Optional) Add premium users feature
node src/db/migrate-premium.js

# Step 7: Restart server
pm2 restart thavanai-server
```

---

## ✅ Expected Output

### After `migrate.js`:
```
Running database migrations...
Connected to SQLite database at: /path/to/server/data/thavanai.db
✓ Database migrations completed successfully
```

### After `migrate-favorites.js`:
```
Connected to the SQLite database for favorite migration.
✅ Favorite books migration completed successfully!
```

---

## 🔍 Verify Database

```bash
# Check if database exists
ls -la ~/Documents/GitHub/thavanai_app/server/data/thavanai.db

# View tables
sqlite3 ~/Documents/GitHub/thavanai_app/server/data/thavanai.db ".tables"

# Check books table has is_favorite column
sqlite3 ~/Documents/GitHub/thavanai_app/server/data/thavanai.db "PRAGMA table_info(books);"
```

**Expected tables:**
- users
- books (with `is_favorite` column)
- entries
- book_shares
- book_pages

---

## 📋 One-Liner (Copy & Paste)

```bash
cd ~/Documents/GitHub/thavanai_app && \
git pull origin main && \
cd server && \
node src/db/migrate.js && \
node src/db/migrate-favorites.js && \
pm2 restart thavanai-server && \
echo "✅ Deployment complete!"
```

---

## 🎯 What Was Fixed

**Problem:** Migration scripts were looking for `database.sqlite` but your database is at `data/thavanai.db`

**Solution:** Updated `migrate-favorites.js` to use correct path:
```javascript
// Old (WRONG):
const dbPath = path.join(__dirname, '../database.sqlite');

// New (CORRECT):
const dbPath = path.join(__dirname, '../../data/thavanai.db');
```

**Status:** ✅ Fixed and pushed to repository (commit `c944a18`)

---

## 📊 Database Location

**Full Path:** `~/Documents/GitHub/thavanai_app/server/data/thavanai.db`

**Relative to server/:** `data/thavanai.db`

**Relative to src/db/:** `../../data/thavanai.db`

All migration scripts now use the correct path!

---

## 🐛 If You Still Get Errors

### Error: "no such table: books"

**Solution:** Run base migration first:
```bash
cd ~/Documents/GitHub/thavanai_app/server
node src/db/migrate.js
```

### Error: "database is locked"

**Solution:** Stop server before migrations:
```bash
pm2 stop thavanai-server
node src/db/migrate.js
node src/db/migrate-favorites.js
pm2 start thavanai-server
```

### Error: "Error opening database"

**Solution:** Create data directory:
```bash
cd ~/Documents/GitHub/thavanai_app/server
mkdir -p data
node src/db/migrate.js
```

---

## ✅ Success Checklist

After running commands:

- [ ] `git pull` completed successfully
- [ ] `data/thavanai.db` file exists
- [ ] `migrate.js` ran without errors
- [ ] `migrate-favorites.js` ran without errors
- [ ] Server restarted: `pm2 status` shows "online"
- [ ] Can query database: `sqlite3 data/thavanai.db ".tables"`
- [ ] Mobile app connects and shows books

---

## 🎉 Ready!

Your database path is now correctly configured. Run the one-liner command above on your production server!

