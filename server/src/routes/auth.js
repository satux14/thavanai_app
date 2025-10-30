const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/connection');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, preferredLanguage = 'en' } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Username, password, and full name are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.run(
      'INSERT INTO users (username, password, full_name, preferred_language) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, fullName, preferredLanguage],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'Username already exists' });
          }
          console.error('Register error:', err);
          return res.status(500).json({ error: 'Failed to register user' });
        }

        const user = {
          id: this.lastID,
          username,
          full_name: fullName,
          preferred_language: preferredLanguage
        };

        const token = generateToken(user);

        res.status(201).json({
          user: {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            preferredLanguage: user.preferred_language
          },
          token
        });
      }
    );
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check if user is active
        if (user.status === 'inactive') {
          return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
        }

        const token = generateToken(user);

        res.json({
          user: {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            preferredLanguage: user.preferred_language
          },
          token
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, full_name as fullName, preferred_language as preferredLanguage FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Get user error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

// Get all users (for displaying in UI)
router.get('/users', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, username, full_name as fullName FROM users ORDER BY username',
    [],
    (err, users) => {
      if (err) {
        console.error('Get users error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(users);
    }
  );
});

module.exports = router;

