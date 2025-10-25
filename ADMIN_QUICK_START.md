# 🔐 Admin Panel - Quick Start Guide

## ✅ What Was Added

### 1. Backend API Routes
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/users` - User management
- `/api/admin/books` - Book management
- Role-based authentication (admin only)

### 2. Web Admin Panel
- Beautiful, modern web interface
- Accessible at `http://localhost:3000/admin`
- No build process needed (plain HTML/CSS/JS)

### 3. Database Changes
- Added `role` column to users (user/admin)
- Added `status` column to users (active/inactive)
- Migration script for existing databases

---

## 🚀 Setup (3 Steps)

### Step 1: Run Admin Migration

```bash
cd /Users/skumarraju/Documents/Work/progs/thavanai_mobile/server
npm run migrate-admin
```

This will:
- Add admin role and status to database
- Create default admin user
- Set up indexes

**Default Admin Credentials**:
- Username: `admin`
- Password: `admin123`

### Step 2: Start Server

```bash
npm start
```

You'll see:
```
╔═══════════════════════════════════════════════════════════╗
║  Thavanai Server - Daily Installment Book API           ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:3000                ║
║  API Documentation: http://localhost:3000/api-docs       ║
║  Admin Panel:       http://localhost:3000/admin         ║  ← NEW!
║  Health Check:      http://localhost:3000/health         ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 3: Access Admin Panel

Open browser: `http://localhost:3000/admin`

Login with:
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password immediately!

---

## 🎯 Admin Panel Features

### Dashboard
- **Live Statistics**:
  - Total users (active/inactive)
  - Total books (active/closed)
  - Total entries (signed/pending)

### User Management
- **Search** users by username or name
- **Filter** by status (all/active/inactive)
- **View** user details:
  - All books owned
  - All books shared with them
  - Entry counts
- **Activate/Deactivate** users
- **Pagination** for large user lists

### Book Management
- **Search** books by name, D.L.No, or owner
- **Filter** by status (all/active/closed)
- **View** book details:
  - Owner information
  - Loan amount and balance
  - All entries with signatures
  - Users it's shared with
- **Close/Reopen** books
- **Pagination** for large book lists

---

## 📊 Screenshots (What You'll See)

### Login Screen
```
┌─────────────────────────────────┐
│     🔐 Admin Login              │
│                                 │
│  Username: [____________]       │
│  Password: [____________]       │
│                                 │
│  [        Login        ]        │
└─────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────────────────────┐
│  📊 Thavanai Admin Panel              [Logout]      │
│  Manage users, books, and monitor system activity   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐    │
│  │   Users   │  │   Books   │  │  Entries   │    │
│  │    150    │  │    523    │  │   12,458   │    │
│  │  142 act  │  │  498 act  │  │ 11,234 sig │    │
│  └───────────┘  └───────────┘  └────────────┘    │
│                                                     │
│  👥 Users  |  📚 Books                            │
│  ───────────────────────────────────────────       │
│                                                     │
│  Search: [____________]  Status: [All ▼]          │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ Username  │ Name     │ Books │ Status │ ... │ │
│  │ john      │ John Doe │  5    │ ✓ Act. │ ... │ │
│  │ mary      │ Mary Jane│  3    │ ✓ Act. │ ... │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  [← Previous]  [1] [2] [3] ... [10]  [Next →]    │
└─────────────────────────────────────────────────────┘
```

---

## 🔒 Security Features

### Authentication
- ✅ JWT-based authentication
- ✅ Token stored in localStorage
- ✅ Auto-logout on token expiry
- ✅ Password hashing (bcrypt)

### Authorization
- ✅ Role-based access control
- ✅ Admin-only routes
- ✅ Middleware protection
- ✅ 403 Forbidden for non-admins

### Best Practices
- ⚠️ Change default password
- ✅ Use strong passwords
- ✅ Create separate admin accounts
- ✅ Don't share credentials
- ✅ Regular backups

---

## 🆘 Troubleshooting

### Admin Panel Won't Load

**Check server is running**:
```bash
curl http://localhost:3000/health
```

**Check admin files exist**:
```bash
ls server/admin-ui/
# Should show: index.html, admin.js, package.json
```

### Can't Login

**Verify admin user exists**:
```bash
cd server
sqlite3 data/thavanai.db "SELECT username, role FROM users WHERE role='admin';"
```

**Re-run migration**:
```bash
npm run migrate-admin
```

### 403 Forbidden Error

- You're not logged in as admin
- Token expired (logout and login again)
- User doesn't have admin role

**Solution**: Run `npm run migrate-admin` to ensure admin user exists.

---

## 📱 Mobile App vs Admin Panel

| Feature | Mobile App | Admin Panel |
|---------|------------|-------------|
| **Users** | Owners & Borrowers | Administrators |
| **Access** | iOS, Android, Web | Web only |
| **Purpose** | Create/manage own books | Monitor all users/books |
| **Functions** | Daily entries, signatures | User management, stats |
| **Data** | Own books + shared | All users + all books |
| **Can Edit** | Own entries | View only (status changes) |

---

## 🎓 Common Admin Tasks

### Task 1: View All Users
1. Login to admin panel
2. Click "Users" tab (default)
3. Use search to find specific user
4. Click "View" to see details

### Task 2: Deactivate a User
1. Find user in Users tab
2. Click "Deactivate" button
3. Confirm action
4. User can no longer login

### Task 3: Check Book Status
1. Click "Books" tab
2. Search for book by name or D.L.No
3. Click "View" to see all details
4. Check entries and balance

### Task 4: Monitor System Health
1. Login to admin panel
2. Check dashboard statistics
3. Look for unusual numbers:
   - Many inactive users
   - Too many pending signatures
   - Sudden spike in books

### Task 5: Close Completed Book
1. Go to Books tab
2. Find the book
3. Click "Close" button
4. Confirm action
5. Book is now closed (read-only)

---

## 📖 Full Documentation

For complete documentation, see:
- **`server/ADMIN_PANEL_GUIDE.md`** - Complete admin guide
- **`DEPLOYMENT_READY.md`** - Production deployment
- **`START_SERVER.md`** - Server startup guide

---

## 🎉 You're Ready!

Your admin panel is now set up! 

**Next Steps**:
1. ✅ Run `npm run migrate-admin`
2. ✅ Start server with `npm start`
3. ✅ Access `http://localhost:3000/admin`
4. ✅ Login with admin/admin123
5. ✅ Change password immediately
6. ✅ Start managing your system!

**Happy administrating! 🚀**

