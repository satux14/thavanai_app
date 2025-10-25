const jwt = require('jsonwebtoken');

// Simple secret key - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'thavanai-secret-key-2024';

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      fullName: user.full_name 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Verify JWT token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  generateToken,
  authenticateToken,
  JWT_SECRET
};

