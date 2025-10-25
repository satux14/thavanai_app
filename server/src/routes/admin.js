const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const bcrypt = require('bcrypt');

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  // User is already authenticated by the JWT middleware
  // Now check if they have admin role
  const userId = req.user.userId;
  
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  });
};

// ==================== DASHBOARD STATS ====================

// Get dashboard statistics
router.get('/stats', adminAuth, (req, res) => {
  const stats = {
    users: { total: 0, active: 0, inactive: 0 },
    books: { total: 0, active: 0, closed: 0 },
    entries: { total: 0, signed: 0, pending: 0 },
  };

  // Count users
  db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
    FROM users
    WHERE role != 'admin'
  `, (err, userStats) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    stats.users = userStats;

    // Count books
    db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM books
    `, (err, bookStats) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      stats.books = bookStats;

      // Count entries
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN signature_status = 'signed_by_request' THEN 1 ELSE 0 END) as signed,
          SUM(CASE WHEN signature_status = 'pending_approval' THEN 1 ELSE 0 END) as pending
        FROM entries
      `, (err, entryStats) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        stats.entries = entryStats;
        
        res.json(stats);
      });
    });
  });
});

// ==================== USER MANAGEMENT ====================

// Get all users (with pagination and search)
router.get('/users', adminAuth, (req, res) => {
  const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE role != 'admin'";
  const params = [];

  if (search) {
    whereClause += " AND (username LIKE ? OR full_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status && status !== 'all') {
    whereClause += " AND status = ?";
    params.push(status);
  }

  // Get total count
  db.get(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params,
    (err, countResult) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const total = countResult.total;

      // Get paginated users
      db.all(
        `SELECT 
          id, username, full_name, preferred_language, role, status, created_at,
          (SELECT COUNT(*) FROM books WHERE owner_id = users.id) as book_count,
          (SELECT COUNT(*) FROM book_shares WHERE shared_with_user_id = users.id) as shared_book_count
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset],
        (err, users) => {
          if (err) return res.status(500).json({ error: 'Database error' });

          res.json({
            users,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(total / limit),
            },
          });
        }
      );
    }
  );
});

// Get single user details with books
router.get('/users/:userId', adminAuth, (req, res) => {
  const { userId } = req.params;

  db.get(
    `SELECT id, username, full_name, preferred_language, role, status, created_at
    FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Get user's books
      db.all(
        `SELECT 
          b.*,
          (SELECT COUNT(*) FROM entries WHERE book_id = b.id) as entry_count,
          (SELECT COUNT(*) FROM book_shares WHERE book_id = b.id) as share_count
        FROM books b
        WHERE b.owner_id = ?
        ORDER BY b.created_at DESC`,
        [userId],
        (err, books) => {
          if (err) return res.status(500).json({ error: 'Database error' });

          // Get books shared with user
          db.all(
            `SELECT b.*, u.username as owner_username, u.full_name as owner_name
            FROM books b
            JOIN book_shares bs ON b.id = bs.book_id
            JOIN users u ON b.owner_id = u.id
            WHERE bs.shared_with_user_id = ?
            ORDER BY bs.created_at DESC`,
            [userId],
            (err, sharedBooks) => {
              if (err) return res.status(500).json({ error: 'Database error' });

              res.json({
                user,
                ownedBooks: books,
                sharedBooks,
              });
            }
          );
        }
      );
    }
  );
});

// Update user status (activate/deactivate)
router.put('/users/:userId/status', adminAuth, (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, userId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });

      res.json({ message: 'User status updated', userId, status });
    }
  );
});

// Delete user (and all their books)
router.delete('/users/:userId', adminAuth, (req, res) => {
  const { userId } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully', userId });
  });
});

// ==================== BOOK MANAGEMENT ====================

// Get all books (with pagination and filters)
router.get('/books', adminAuth, (req, res) => {
  const { page = 1, limit = 20, search = '', status = 'all', userId = null } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (search) {
    whereClause += " AND (b.name LIKE ? OR b.dl_no LIKE ? OR u.username LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status && status !== 'all') {
    whereClause += " AND b.status = ?";
    params.push(status);
  }

  if (userId) {
    whereClause += " AND b.owner_id = ?";
    params.push(userId);
  }

  // Get total count
  db.get(
    `SELECT COUNT(*) as total FROM books b JOIN users u ON b.owner_id = u.id ${whereClause}`,
    params,
    (err, countResult) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const total = countResult.total;

      // Get paginated books
      db.all(
        `SELECT 
          b.*, 
          u.username as owner_username, 
          u.full_name as owner_name,
          (SELECT COUNT(*) FROM entries WHERE book_id = b.id) as entry_count,
          (SELECT SUM(amount) FROM entries WHERE book_id = b.id) as total_paid,
          (SELECT COUNT(*) FROM book_shares WHERE book_id = b.id) as share_count
        FROM books b
        JOIN users u ON b.owner_id = u.id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset],
        (err, books) => {
          if (err) return res.status(500).json({ error: 'Database error' });

          res.json({
            books,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(total / limit),
            },
          });
        }
      );
    }
  );
});

// Get single book details with entries
router.get('/books/:bookId', adminAuth, (req, res) => {
  const { bookId } = req.params;

  db.get(
    `SELECT 
      b.*, 
      u.username as owner_username, 
      u.full_name as owner_name
    FROM books b
    JOIN users u ON b.owner_id = u.id
    WHERE b.id = ?`,
    [bookId],
    (err, book) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!book) return res.status(404).json({ error: 'Book not found' });

      // Get entries
      db.all(
        `SELECT * FROM entries WHERE book_id = ? ORDER BY serial_number ASC`,
        [bookId],
        (err, entries) => {
          if (err) return res.status(500).json({ error: 'Database error' });

          // Get shares
          db.all(
            `SELECT bs.*, u.username, u.full_name
            FROM book_shares bs
            JOIN users u ON bs.shared_with_user_id = u.id
            WHERE bs.book_id = ?`,
            [bookId],
            (err, shares) => {
              if (err) return res.status(500).json({ error: 'Database error' });

              res.json({
                book,
                entries,
                shares,
              });
            }
          );
        }
      );
    }
  );
});

// Update book status
router.put('/books/:bookId/status', adminAuth, (req, res) => {
  const { bookId } = req.params;
  const { status } = req.body;

  if (!['active', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    'UPDATE books SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, bookId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Book not found' });

      res.json({ message: 'Book status updated', bookId, status });
    }
  );
});

// Delete book
router.delete('/books/:bookId', adminAuth, (req, res) => {
  const { bookId } = req.params;

  db.run('DELETE FROM books WHERE id = ?', [bookId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Book not found' });

    res.json({ message: 'Book deleted successfully', bookId });
  });
});

// ==================== ADMIN USER MANAGEMENT ====================

// Create admin user (only if no admin exists or by existing admin)
router.post('/create-admin', (req, res) => {
  const { username, password, fullName, secretKey } = req.body;

  // Check if this is initial admin creation (no admins exist)
  db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", async (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    const hasAdmins = result.count > 0;

    // If admins exist, require authentication and secret key
    if (hasAdmins) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      // Optional: Check secret key for additional security
      if (secretKey !== process.env.ADMIN_SECRET_KEY && process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Invalid secret key' });
      }
    }

    // Create admin user
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        `INSERT INTO users (username, password, full_name, role, status, preferred_language) 
         VALUES (?, ?, ?, 'admin', 'active', 'en')`,
        [username, hashedPassword, fullName],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE')) {
              return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            message: 'Admin user created successfully',
            userId: this.lastID,
            username,
          });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Error creating admin user' });
    }
  });
});

module.exports = router;

