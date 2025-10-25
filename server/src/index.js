const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const entriesRoutes = require('./routes/entries');
const sharingRoutes = require('./routes/sharing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/sharing', sharingRoutes);

// OpenAPI/Swagger Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('✓ Swagger documentation available at /api-docs');
} catch (error) {
  console.warn('⚠ OpenAPI spec not found, skipping documentation');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  Thavanai Server - Daily Installment Book API          ║
╠══════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}              ║
║  API Documentation: http://localhost:${PORT}/api-docs     ║
║  Health Check:      http://localhost:${PORT}/health       ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

