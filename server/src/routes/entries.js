const express = require('express');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Get all entries for a book
router.get('/book/:bookId', (req, res) => {
  // Verify access to book
  const accessQuery = `
    SELECT 1 FROM books b
    LEFT JOIN book_shares bs ON b.id = bs.book_id
    WHERE b.id = ? AND (b.owner_id = ? OR bs.shared_with_user_id = ?)
  `;

  db.get(accessQuery, [req.params.bookId, req.user.id, req.user.id], (err, hasAccess) => {
    if (err || !hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.all(
      'SELECT * FROM entries WHERE book_id = ? ORDER BY serial_number',
      [req.params.bookId],
      (err, entries) => {
        if (err) {
          console.error('Get entries error:', err);
          return res.status(500).json({ error: 'Failed to fetch entries' });
        }

        const formattedEntries = entries.map(e => ({
          id: e.id,
          bookId: e.book_id,
          serialNumber: e.serial_number,
          pageNumber: e.page_number,
          date: e.date,
          amount: e.amount,
          remaining: e.remaining,
          signatureStatus: e.signature_status,
          signatureRequestedBy: e.signature_requested_by,
          signedBy: e.signed_by,
          signedAt: e.signed_at
        }));

        res.json(formattedEntries);
      }
    );
  });
});

// Create or update entry
router.post('/', (req, res) => {
  const {
    id,
    bookId,
    serialNumber,
    pageNumber,
    date,
    amount,
    remaining,
    signatureStatus,
    signatureRequestedBy,
    signedBy,
    signedAt
  } = req.body;

  if (!id || !bookId || serialNumber === undefined) {
    return res.status(400).json({ error: 'ID, bookId, and serialNumber are required' });
  }

  // Verify access to book
  const accessQuery = `
    SELECT 1 FROM books b
    LEFT JOIN book_shares bs ON b.id = bs.book_id
    WHERE b.id = ? AND (b.owner_id = ? OR bs.shared_with_user_id = ?)
  `;

  db.get(accessQuery, [bookId, req.user.id, req.user.id], (err, hasAccess) => {
    if (err || !hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      INSERT INTO entries (
        id, book_id, serial_number, page_number, date, amount, remaining,
        signature_status, signature_requested_by, signed_by, signed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(book_id, serial_number) DO UPDATE SET
        page_number = excluded.page_number,
        date = excluded.date,
        amount = excluded.amount,
        remaining = excluded.remaining,
        signature_status = excluded.signature_status,
        signature_requested_by = excluded.signature_requested_by,
        signed_by = excluded.signed_by,
        signed_at = excluded.signed_at,
        updated_at = CURRENT_TIMESTAMP
    `;

    db.run(
      query,
      [id, bookId, serialNumber, pageNumber, date, amount, remaining, signatureStatus, signatureRequestedBy, signedBy, signedAt],
      function(err) {
        if (err) {
          console.error('Save entry error:', err);
          return res.status(500).json({ error: 'Failed to save entry' });
        }

        // Update book's updated_at
        db.run('UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [bookId]);

        res.status(201).json({ message: 'Entry saved successfully', id });
      }
    );
  });
});

// Request signature
router.post('/:entryId/request-signature', (req, res) => {
  db.get('SELECT * FROM entries WHERE id = ?', [req.params.entryId], (err, entry) => {
    if (err || !entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Verify access
    const accessQuery = `
      SELECT b.owner_id FROM books b
      LEFT JOIN book_shares bs ON b.id = bs.book_id
      WHERE b.id = ? AND (b.owner_id = ? OR bs.shared_with_user_id = ?)
    `;

    db.get(accessQuery, [entry.book_id, req.user.id, req.user.id], (err, access) => {
      if (err || !access) {
        return res.status(403).json({ error: 'Access denied' });
      }

      db.run(
        `UPDATE entries SET 
          signature_status = 'signature_requested',
          signature_requested_by = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [req.user.id, req.params.entryId],
        (err) => {
          if (err) {
            console.error('Request signature error:', err);
            return res.status(500).json({ error: 'Failed to request signature' });
          }

          res.json({ message: 'Signature requested successfully' });
        }
      );
    });
  });
});

// Approve signature
router.post('/:entryId/approve-signature', (req, res) => {
  db.get('SELECT * FROM entries WHERE id = ?', [req.params.entryId], (err, entry) => {
    if (err || !entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (entry.signature_requested_by === req.user.id) {
      return res.status(400).json({ error: 'Cannot approve your own signature request' });
    }

    db.run(
      `UPDATE entries SET 
        signature_status = 'signed_by_request',
        signed_by = ?,
        signed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [req.user.id, req.params.entryId],
      (err) => {
        if (err) {
          console.error('Approve signature error:', err);
          return res.status(500).json({ error: 'Failed to approve signature' });
        }

        res.json({ message: 'Signature approved successfully' });
      }
    );
  });
});

// Reject signature
router.post('/:entryId/reject-signature', (req, res) => {
  db.get('SELECT * FROM entries WHERE id = ?', [req.params.entryId], (err, entry) => {
    if (err || !entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (entry.signature_requested_by === req.user.id) {
      return res.status(400).json({ error: 'Cannot reject your own signature request' });
    }

    db.run(
      `UPDATE entries SET 
        signature_status = 'request_rejected',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [req.params.entryId],
      (err) => {
        if (err) {
          console.error('Reject signature error:', err);
          return res.status(500).json({ error: 'Failed to reject signature' });
        }

        res.json({ message: 'Signature rejected successfully' });
      }
    );
  });
});

module.exports = router;

