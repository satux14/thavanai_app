const express = require('express');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Share book with user
router.post('/', (req, res) => {
  const { bookId, username } = req.body;

  if (!bookId || !username) {
    return res.status(400).json({ error: 'Book ID and username are required' });
  }

  // Verify ownership
  db.get('SELECT owner_id FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err || !book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only share your own books' });
    }

    // Get target user ID
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, targetUser) => {
      if (err || !targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (targetUser.id === req.user.id) {
        return res.status(400).json({ error: 'Cannot share book with yourself' });
      }

      // Insert share
      db.run(
        'INSERT INTO book_shares (book_id, shared_with_user_id) VALUES (?, ?)',
        [bookId, targetUser.id],
        (err) => {
          if (err) {
            if (err.message.includes('UNIQUE constraint')) {
              return res.status(409).json({ error: 'Book already shared with this user' });
            }
            console.error('Share book error:', err);
            return res.status(500).json({ error: 'Failed to share book' });
          }

          res.status(201).json({ message: 'Book shared successfully' });
        }
      );
    });
  });
});

// Get users a book is shared with
router.get('/:bookId', (req, res) => {
  // Verify ownership
  db.get('SELECT owner_id FROM books WHERE id = ?', [req.params.bookId], (err, book) => {
    if (err || !book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only view shares for your own books' });
    }

    const query = `
      SELECT u.id, u.username, u.full_name as fullName
      FROM book_shares bs
      JOIN users u ON bs.shared_with_user_id = u.id
      WHERE bs.book_id = ?
      ORDER BY u.username
    `;

    db.all(query, [req.params.bookId], (err, users) => {
      if (err) {
        console.error('Get shares error:', err);
        return res.status(500).json({ error: 'Failed to fetch shares' });
      }

      res.json(users);
    });
  });
});

// Unshare book from user
router.delete('/:bookId/:userId', (req, res) => {
  // Verify ownership
  db.get('SELECT owner_id FROM books WHERE id = ?', [req.params.bookId], (err, book) => {
    if (err || !book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only unshare your own books' });
    }

    db.run(
      'DELETE FROM book_shares WHERE book_id = ? AND shared_with_user_id = ?',
      [req.params.bookId, req.params.userId],
      (err) => {
        if (err) {
          console.error('Unshare book error:', err);
          return res.status(500).json({ error: 'Failed to unshare book' });
        }

        res.json({ message: 'Book unshared successfully' });
      }
    );
  });
});

module.exports = router;

