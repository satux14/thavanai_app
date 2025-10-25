const express = require('express');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all books (owned + shared)
router.get('/', (req, res) => {
  const query = `
    SELECT 
      b.*,
      u.username as owner_username,
      u.full_name as owner_name,
      CASE WHEN b.owner_id = ? THEN 1 ELSE 0 END as is_owned,
      CASE WHEN bs.book_id IS NOT NULL THEN 1 ELSE 0 END as is_shared
    FROM books b
    LEFT JOIN users u ON b.owner_id = u.id
    LEFT JOIN book_shares bs ON b.id = bs.book_id AND bs.shared_with_user_id = ?
    WHERE b.owner_id = ? OR bs.shared_with_user_id = ?
    ORDER BY b.updated_at DESC
  `;

  db.all(query, [req.user.id, req.user.id, req.user.id, req.user.id], (err, books) => {
    if (err) {
      console.error('Get books error:', err);
      return res.status(500).json({ error: 'Failed to fetch books' });
    }

    // Convert snake_case to camelCase
    const formattedBooks = books.map(book => ({
      id: book.id,
      ownerId: book.owner_id,
      ownerUsername: book.owner_username,
      ownerName: book.owner_name,
      dlNo: book.dl_no,
      name: book.name,
      fatherName: book.father_name,
      address: book.address,
      loanAmount: book.loan_amount,
      numberOfDays: book.number_of_days || 100,
      startDate: book.start_date,
      endDate: book.end_date,
      status: book.status,
      backgroundColor: book.background_color,
      backgroundImage: book.background_image,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
      isOwned: book.is_owned === 1,
      isShared: book.is_shared === 1
    }));

    res.json(formattedBooks);
  });
});

// Get single book
router.get('/:id', (req, res) => {
  const query = `
    SELECT 
      b.*,
      u.username as owner_username,
      u.full_name as owner_name
    FROM books b
    LEFT JOIN users u ON b.owner_id = u.id
    LEFT JOIN book_shares bs ON b.id = bs.book_id
    WHERE b.id = ? AND (b.owner_id = ? OR bs.shared_with_user_id = ?)
  `;

  db.get(query, [req.params.id, req.user.id, req.user.id], (err, book) => {
    if (err) {
      console.error('Get book error:', err);
      return res.status(500).json({ error: 'Failed to fetch book' });
    }

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      id: book.id,
      ownerId: book.owner_id,
      ownerUsername: book.owner_username,
      ownerName: book.owner_name,
      dlNo: book.dl_no,
      name: book.name,
      fatherName: book.father_name,
      address: book.address,
      loanAmount: book.loan_amount,
      numberOfDays: book.number_of_days || 100,
      startDate: book.start_date,
      endDate: book.end_date,
      status: book.status,
      backgroundColor: book.background_color,
      backgroundImage: book.background_image,
      createdAt: book.created_at,
      updatedAt: book.updated_at
    });
  });
});

// Create book
router.post('/', (req, res) => {
  const {
    id,
    dlNo,
    name,
    fatherName,
    address,
    loanAmount,
    numberOfDays,
    startDate,
    endDate,
    backgroundColor,
    backgroundImage
  } = req.body;

  if (!id || !name || !loanAmount) {
    return res.status(400).json({ error: 'ID, name, and loan amount are required' });
  }

  const query = `
    INSERT INTO books (
      id, owner_id, dl_no, name, father_name, address, loan_amount, number_of_days,
      start_date, end_date, background_color, background_image, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(
    query,
    [id, req.user.id, dlNo, name, fatherName, address, loanAmount, numberOfDays || 100, startDate, endDate, backgroundColor, backgroundImage],
    function(err) {
      if (err) {
        console.error('Create book error:', err);
        return res.status(500).json({ error: 'Failed to create book' });
      }

      res.status(201).json({
        id,
        ownerId: req.user.id,
        dlNo,
        name,
        fatherName,
        address,
        loanAmount,
        numberOfDays: numberOfDays || 100,
        startDate,
        endDate,
        status: 'active',
        backgroundColor,
        backgroundImage
      });
    }
  );
});

// Update book
router.put('/:id', (req, res) => {
  const {
    dlNo,
    name,
    fatherName,
    address,
    loanAmount,
    startDate,
    endDate,
    backgroundColor,
    backgroundImage
  } = req.body;

  // Verify ownership
  db.get('SELECT owner_id FROM books WHERE id = ?', [req.params.id], (err, book) => {
    if (err) {
      console.error('Update book error:', err);
      return res.status(500).json({ error: 'Failed to update book' });
    }

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own books' });
    }

    const query = `
      UPDATE books SET
        dl_no = ?, name = ?, father_name = ?, address = ?, loan_amount = ?,
        start_date = ?, end_date = ?, background_color = ?, background_image = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(
      query,
      [dlNo, name, fatherName, address, loanAmount, startDate, endDate, backgroundColor, backgroundImage, req.params.id],
      function(err) {
        if (err) {
          console.error('Update book error:', err);
          return res.status(500).json({ error: 'Failed to update book' });
        }

        res.json({ message: 'Book updated successfully' });
      }
    );
  });
});

// Close book
router.patch('/:id/close', (req, res) => {
  // Verify ownership
  db.get('SELECT owner_id FROM books WHERE id = ?', [req.params.id], (err, book) => {
    if (err || !book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only close your own books' });
    }

    db.run(
      'UPDATE books SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['closed', req.params.id],
      (err) => {
        if (err) {
          console.error('Close book error:', err);
          return res.status(500).json({ error: 'Failed to close book' });
        }

        res.json({ message: 'Book closed successfully' });
      }
    );
  });
});

// Reopen book
router.patch('/:id/reopen', (req, res) => {
  // Verify ownership
  db.get('SELECT owner_id FROM books WHERE id = ?', [req.params.id], (err, book) => {
    if (err || !book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only reopen your own books' });
    }

    db.run(
      'UPDATE books SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['active', req.params.id],
      (err) => {
        if (err) {
          console.error('Reopen book error:', err);
          return res.status(500).json({ error: 'Failed to reopen book' });
        }

        res.json({ message: 'Book reopened successfully' });
      }
    );
  });
});

// Delete book
router.delete('/:id', (req, res) => {
  // Verify ownership
  db.get('SELECT owner_id FROM books WHERE id = ?', [req.params.id], (err, book) => {
    if (err || !book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own books' });
    }

    db.run('DELETE FROM books WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        console.error('Delete book error:', err);
        return res.status(500).json({ error: 'Failed to delete book' });
      }

      res.json({ message: 'Book deleted successfully' });
    });
  });
});

module.exports = router;

