const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../data/thavanai.db');

const runMigration = () => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    } else {
      console.log('Connected to the SQLite database for favorite migration.');
      executeMigration(db);
    }
  });
};

const executeMigration = (db) => {
  db.serialize(() => {
    // Check if is_favorite column already exists
    db.all("PRAGMA table_info(books)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking table:', err);
        process.exit(1);
      }
      
      const hasFavorite = columns.some(col => col.name === 'is_favorite');
      
      if (!hasFavorite) {
        console.log('Adding is_favorite column...');
        db.run("ALTER TABLE books ADD COLUMN is_favorite INTEGER DEFAULT 0", (err) => {
          if (err) {
            console.error('❌ Error adding is_favorite column:', err);
            process.exit(1);
          } else {
            console.log('✓ is_favorite column added');
            createIndex(db);
          }
        });
      } else {
        console.log('✓ is_favorite column already exists');
        createIndex(db);
      }
    });
  });
};

const createIndex = (db) => {
  console.log('Creating index for faster sorting...');
  db.run("CREATE INDEX IF NOT EXISTS idx_books_favorite ON books (is_favorite DESC, updated_at DESC)", (err) => {
    if (err) {
      console.error('❌ Error creating index:', err);
      process.exit(1);
    } else {
      console.log('✓ Index created');
      console.log('✅ Favorite books migration completed successfully!');
      db.close();
    }
  });
};

runMigration();
