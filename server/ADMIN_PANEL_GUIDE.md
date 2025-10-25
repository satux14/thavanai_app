# 🔐 Thavanai Admin Panel Guide

Complete guide for managing users and books through the web-based admin panel.

## 🚀 Quick Start

### 1. Setup Admin User

```bash
cd server
npm run migrate-admin
```

This will:
- Add `role` and `status` columns to users table
- Create indexes for better performance
- Create default admin user (if none exists)

**Default Admin Credentials**:
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change this password after first login!

### 2. Start the Server

```bash
npm start
```

### 3. Access Admin Panel

Open your browser and navigate to:
```
http://localhost:3000/admin
```

Login with admin credentials.

---

## 🎯 Admin Panel Features

### Dashboard Overview

When you login, you'll see:

**Statistics Cards**:
- **Total Users**: Active and inactive user counts
- **Total Books**: Active and closed book counts
- **Total Entries**: Signed and pending signature counts

### 👥 User Management

#### View All Users
- **Search**: Find users by username or full name
- **Filter**: Show all, active, or inactive users
- **Pagination**: Navigate through large user lists

#### User Details
Click **View** on any user to see:
- User information (ID, username, full name, language, status)
- All books owned by the user
- All books shared with the user
- Entry counts and statistics

#### User Actions
- **Activate/Deactivate**: Change user status
  - Inactive users cannot login
  - Their books remain but are not accessible
- **View Details**: See comprehensive user information

### 📚 Book Management

#### View All Books
- **Search**: Find books by name, D.L.No, or owner username
- **Filter**: Show all, active, or closed books
- **Pagination**: Navigate through large book lists

#### Book Details
Click **View** on any book to see:
- Book information (D.L.No, name, father name, address)
- Owner details
- Loan amount and current balance
- All entries with dates, amounts, and signatures
- Users the book is shared with

#### Book Actions
- **Close/Reopen**: Change book status
  - Closed books cannot be edited
  - Can be reopened by admin
- **View Details**: See comprehensive book information

---

## 🛠️ Administration Tasks

### Creating Additional Admin Users

**Option 1: Through API** (Recommended for first admin)

```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "new_admin",
    "password": "secure_password",
    "fullName": "New Admin Name"
  }'
```

**Option 2: Direct Database** (For recovery)

```bash
cd server
sqlite3 data/thavanai.db

UPDATE users SET role = 'admin' WHERE username = 'existing_user';
```

### Managing User Issues

**User Can't Login**:
1. Check user status in Admin Panel
2. If inactive, click "Activate"
3. User should now be able to login

**Suspicious Activity**:
1. Go to User Details
2. Review all books and shared books
3. Check entry patterns
4. Deactivate user if needed

**Delete User Data**:
⚠️ This is permanent and cannot be undone!
```bash
# Use API endpoint (coming soon) or direct database
```

### Managing Book Issues

**Book Stuck in Pending State**:
1. View book details
2. Check all entries and signatures
3. Close book if payment complete
4. Or contact owner/borrower

**Dispute Resolution**:
1. View book details in admin panel
2. Check all entries and signatures
3. Review who signed what and when
4. Export data for records (PDF feature)

---

## 🔒 Security Best Practices

### Password Management
1. **Change default password immediately** after first login
2. Use strong passwords (12+ characters, mixed case, numbers, symbols)
3. Don't share admin credentials

### Access Control
1. Create separate admin accounts for each administrator
2. Don't use the default `admin` account for daily operations
3. Regularly review who has admin access

### Monitoring
1. Regularly check dashboard statistics
2. Look for unusual patterns:
   - Sudden spike in users or books
   - Many inactive users
   - High number of pending signatures
3. Review user activity periodically

### Data Protection
1. Regular database backups:
   ```bash
   cp server/data/thavanai.db server/data/backup-$(date +%Y%m%d).db
   ```
2. Keep server updated
3. Use HTTPS in production
4. Set strong JWT_SECRET in production

---

## 📊 Understanding the Data

### User Roles
- **user**: Regular user (default)
- **admin**: Administrator with full access

### User Status
- **active**: User can login and use the app
- **inactive**: User cannot login, data preserved

### Book Status
- **active**: Book is open for new entries
- **closed**: Book is completed, no new entries

### Signature Status
- **none**: No signature requested
- **pending_approval**: Signature requested, waiting for approval
- **signed_by_request**: Approved by other party
- **signed_by_owner**: Owner signed directly (legacy)

---

## 🐛 Troubleshooting

### Admin Panel Won't Load

**Check server is running**:
```bash
curl http://localhost:3000/health
```

**Check admin UI files**:
```bash
ls server/admin-ui/
# Should see: index.html, admin.js
```

**Check browser console**:
- Open browser DevTools (F12)
- Look for JavaScript errors
- Check Network tab for API errors

### Can't Login

**Verify admin user exists**:
```bash
cd server
sqlite3 data/thavanai.db "SELECT username, role FROM users WHERE role='admin';"
```

**Reset admin password**:
```bash
npm run migrate-admin
# This will NOT create duplicate, just verify existing admin
```

**Manually reset**:
```bash
cd server
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('newpassword', 10).then(hash => console.log(hash));"
# Copy the hash
sqlite3 data/thavanai.db "UPDATE users SET password='PASTE_HASH_HERE' WHERE username='admin';"
```

### API Errors

**403 Forbidden**:
- You're not logged in as admin
- Token expired (logout and login again)
- User doesn't have admin role

**500 Internal Server Error**:
- Check server logs
- Database might be corrupted
- Missing table columns (run `npm run migrate-admin`)

---

## 🔧 Advanced Configuration

### Custom Admin Port

Edit `server/src/index.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

Set environment variable:
```bash
PORT=8000 npm start
```

### Environment Variables

Create `server/.env`:
```
PORT=3000
JWT_SECRET=your-very-secure-secret-key-here
ADMIN_SECRET_KEY=optional-extra-security-key
NODE_ENV=production
```

### Reverse Proxy (Production)

For production, use nginx or similar:

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Custom Styling

Edit `server/admin-ui/index.html` to customize:
- Colors
- Logo
- Layout
- Branding

---

## 📱 Mobile App vs Admin Panel

**Mobile App**:
- Used by owners and borrowers
- Create and manage own books
- Daily entries and signatures
- Collaboration features

**Admin Panel**:
- Used by system administrators
- Monitor all users and books
- Resolve disputes
- Manage user access
- System statistics

**Admin Cannot**:
- Create books for users
- Add entries to books
- Sign on behalf of users
- See user passwords

---

## 🆘 Support

### Common Questions

**Q: Can I have multiple admins?**
A: Yes! Use the create-admin API endpoint or update user role directly.

**Q: Will admin actions notify users?**
A: No, admin actions are silent. Users won't be notified.

**Q: Can I export data?**
A: Currently, you can export individual book PDFs. Database backups recommended for full export.

**Q: Is there an admin audit log?**
A: Not yet. Consider adding server logging for production use.

### Getting Help

1. Check server logs for errors
2. Check browser console for client errors
3. Review this documentation
4. Check database integrity: `sqlite3 data/thavanai.db ".schema"`

---

## 🎉 You're All Set!

The admin panel is now ready to use. Remember:

✅ Change default admin password
✅ Create separate admin accounts
✅ Regular database backups
✅ Monitor system statistics
✅ Review user activity periodically

**Happy administrating! 🚀**

