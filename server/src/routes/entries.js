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

// Bulk create/update entries (efficient for multiple entries)
router.post('/bulk', (req, res) => {
  const { bookId, entries } = req.body;

  if (!bookId || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'bookId and entries array are required' });
  }

  console.log(`📦 Bulk update: ${entries.length} entries for book ${bookId}`);

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

    // Use a transaction for efficiency
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

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

      let successCount = 0;
      let errorCount = 0;

      entries.forEach((entry, index) => {
        const params = [
          entry.id,
          bookId,
          entry.serialNumber,
          entry.pageNumber || 1,
          entry.date || null,
          entry.amount !== undefined && entry.amount !== null ? entry.amount : null,
          entry.remaining !== undefined && entry.remaining !== null ? entry.remaining : null,
          entry.signatureStatus || 'none',
          entry.signatureRequestedBy || null,
          entry.signedBy || null,
          entry.signedAt || null
        ];

        db.run(query, params, function(err) {
          if (err) {
            console.error(`❌ Bulk update entry ${index + 1}/${entries.length} failed:`, err);
            errorCount++;
          } else {
            successCount++;
          }

          // If this is the last entry, commit or rollback
          if (index === entries.length - 1) {
            if (errorCount > 0) {
              db.run('ROLLBACK', () => {
                console.error(`❌ Bulk update failed: ${errorCount} errors`);
                res.status(500).json({ 
                  error: 'Bulk update failed',
                  successCount,
                  errorCount
                });
              });
            } else {
              db.run('COMMIT', () => {
                // Update book's updated_at
                db.run('UPDATE books SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [bookId]);
                
                console.log(`✅ Bulk update successful: ${successCount} entries updated`);
                res.status(200).json({ 
                  message: 'Bulk update successful',
                  count: successCount
                });
              });
            }
          }
        });
      });
    });
  });
});

// Create or update entry
router.post('/', (req, res) => {
  const {
    id,
    bookId,
    serialNumber,
    pageNumber = 1,
    date = null,
    amount = null,
    remaining = null,
    signatureStatus = 'none',
    signatureRequestedBy = null,
    signedBy = null,
    signedAt = null
  } = req.body;

  if (!id || !bookId || serialNumber === undefined || serialNumber === null) {
    console.error('Missing required fields:', { id, bookId, serialNumber });
    return res.status(400).json({ 
      error: 'ID, bookId, and serialNumber are required',
      received: { id, bookId, serialNumber }
    });
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

    const params = [
      id, 
      bookId, 
      serialNumber, 
      pageNumber || 1, 
      date || null, 
      amount || null, 
      remaining || null, 
      signatureStatus || 'none', 
      signatureRequestedBy || null, 
      signedBy || null, 
      signedAt || null
    ];

    db.run(
      query,
      params,
      function(err) {
        if (err) {
          console.error('Save entry error:', err);
          console.error('Failed params:', params);
          return res.status(500).json({ error: 'Failed to save entry', details: err.message });
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

