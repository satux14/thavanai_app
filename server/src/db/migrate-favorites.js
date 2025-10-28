const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Read the SQL file
const sql = fs.readFileSync(path.join(__dirname, 'add-favorite-books.sql'), 'utf8');

// Execute the migration
db.exec(sql, (err) => {
  if (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
  console.log('✅ Favorite books migration completed successfully!');
  db.close();
});

