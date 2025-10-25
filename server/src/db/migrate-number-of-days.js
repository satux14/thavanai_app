const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/thavanai.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding number_of_days column to books table...');

db.serialize(() => {
  // Check if column exists
  db.all("PRAGMA table_info(books)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      db.close();
      return;
    }
    
    const hasColumn = columns.some(col => col.name === 'number_of_days');
    
    if (!hasColumn) {
      console.log('Adding number_of_days column...');
      db.run("ALTER TABLE books ADD COLUMN number_of_days INTEGER DEFAULT 100", (err) => {
        if (err) {
          console.error('Error adding number_of_days column:', err);
        } else {
          console.log('✓ number_of_days column added successfully');
        }
        
        console.log('\n✅ Migration complete!');
        db.close();
      });
    } else {
      console.log('✓ number_of_days column already exists');
      console.log('\n✅ Migration complete!');
      db.close();
    }
  });
});

