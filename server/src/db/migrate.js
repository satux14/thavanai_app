const fs = require('fs');
const path = require('path');
const db = require('./connection');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Running database migrations...');

db.exec(schema, (err) => {
  if (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } else {
    console.log('✓ Database migrations completed successfully');
    db.close();
    process.exit(0);
  }
});

