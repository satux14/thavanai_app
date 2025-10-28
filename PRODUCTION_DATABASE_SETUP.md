# 🗄️ Production Database Setup Guide

## 🚨 Issue: "no such table: books"

This error means the database hasn't been initialized yet. You need to run the **base migration** first before applying the favorites migration.

---

## ✅ Solution: Initialize Database (Step by Step)

### **Step 1: Navigate to Server Directory**
```bash
cd ~/Documents/GitHub/thavanai_app/server
```

### **Step 2: Initialize Base Database Schema**

This creates all the tables (users, books, entries, book_shares, book_pages):

```bash
node src/db/migrate.js
```

**Expected Output:**
```
Running database migrations...
✓ Database migrations completed successfully
```

**What This Creates:**
- ✅ `users` table
- ✅ `books` table
- ✅ `entries` table
- ✅ `book_shares` table
- ✅ `book_pages` table
- ✅ All necessary indexes

---

### **Step 3: Add Favorite Feature**

Now that the base tables exist, add the `is_favorite` column:

```bash
node src/db/migrate-favorites.js
```

**Expected Output:**
```
Connected to the SQLite database for favorite migration.
Favorite books migration applied successfully.
Database connection closed.
```

---

### **Step 4: (Optional) Add Other Features**

If you want to add admin features and premium user support:

```bash
# Add admin user feature
node src/db/migrate-admin.js

# Add premium/ad-free users feature  
node src/db/migrate-premium.js

# Add number of days field
node src/db/migrate-number-of-days.js
```

---

### **Step 5: Verify Database**

Check that all tables and columns exist:

```bash
# Open SQLite shell
sqlite3 database.sqlite

# List all tables
.tables

# Check books table structure (should show is_favorite)
PRAGMA table_info(books);

# Exit SQLite
.exit
```

**Expected tables:**
- users
- books (with `is_favorite` column)
- entries
- book_shares
- book_pages
- premium_users (if you ran migrate-premium.js)

---

### **Step 6: Restart Server**

```bash
# If using PM2
pm2 restart thavanai-server

# OR start manually
npm start
```

---

## 📋 Complete Production Setup Checklist

Run these commands in order on your production server:

```bash
# 1. Navigate to app directory
cd ~/Documents/GitHub/thavanai_app
git pull origin main

# 2. Install dependencies
npm install
cd server
npm install

# 3. Initialize database
node src/db/migrate.js          # Base tables
node src/db/migrate-favorites.js # Favorite feature
node src/db/migrate-admin.js    # Admin feature (optional)
node src/db/migrate-premium.js  # Premium users (optional)

# 4. Start/restart server
pm2 restart thavanai-server
# OR
pm2 start src/index.js --name thavanai-server

# 5. Verify
pm2 logs thavanai-server
curl http://localhost:3000/health
```

---

## 🔍 Verify Database Structure

After running all migrations, your `books` table should look like this:

```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  dl_no TEXT,
  name TEXT NOT NULL,
  father_name TEXT,
  address TEXT,
  loan_amount REAL NOT NULL,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'active',
  background_color TEXT,
  background_image TEXT,
  is_favorite INTEGER DEFAULT 0,  -- ← NEW COLUMN
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🐛 Troubleshooting

### **Error: "database is locked"**
```bash
# Stop the server first
pm2 stop thavanai-server

# Run migrations
node src/db/migrate.js
node src/db/migrate-favorites.js

# Restart server
pm2 restart thavanai-server
```

### **Error: "Migration already run / column already exists"**
This is **safe to ignore**. The migrations use `IF NOT EXISTS` clauses and are idempotent.

### **Check Database Location**
```bash
# Default location
ls -la ~/Documents/GitHub/thavanai_app/server/database.sqlite

# Check if database file exists
file database.sqlite
```

### **Reset Database (⚠️ Destructive - All Data Lost)**
If you need to start fresh:
```bash
# Backup first!
cp database.sqlite database.sqlite.backup

# Delete database
rm database.sqlite

# Re-run migrations
node src/db/migrate.js
node src/db/migrate-favorites.js
```

---

## 🎯 Quick Command Reference

```bash
# Complete fresh setup
cd ~/Documents/GitHub/thavanai_app/server
node src/db/migrate.js && \
node src/db/migrate-favorites.js && \
pm2 restart thavanai-server

# Verify setup
sqlite3 database.sqlite "SELECT COUNT(*) FROM books;"
curl http://localhost:3000/health
```

---

## 📊 Database File Location

**Default:** `~/Documents/GitHub/thavanai_app/server/database.sqlite`

This is where all your data is stored. Make sure to:
- ✅ Backup regularly
- ✅ Set proper file permissions
- ✅ Include in your backup strategy

---

## 🔐 Production Best Practices

1. **Backup Before Migrations:**
   ```bash
   cp database.sqlite database.sqlite.backup.$(date +%Y%m%d_%H%M%S)
   ```

2. **Test Migrations on Copy:**
   ```bash
   cp database.sqlite test.sqlite
   sqlite3 test.sqlite < src/db/add-favorite-books.sql
   ```

3. **Monitor Logs:**
   ```bash
   pm2 logs thavanai-server --lines 100
   ```

4. **Verify After Migration:**
   ```bash
   sqlite3 database.sqlite "PRAGMA table_info(books);"
   ```

---

## ✅ Success Checklist

After running the setup:

- [ ] `node src/db/migrate.js` completed successfully
- [ ] `node src/db/migrate-favorites.js` completed successfully
- [ ] Server restarted without errors
- [ ] `/health` endpoint returns OK
- [ ] Database file exists: `database.sqlite`
- [ ] `books` table has `is_favorite` column
- [ ] Mobile app can connect and fetch books

---

## 🎉 Done!

Your production database is now set up with:
- ✅ All base tables (users, books, entries, shares)
- ✅ Favorite books feature
- ✅ All necessary indexes
- ✅ Ready for mobile app

**Next:** Test the app to ensure everything works!

