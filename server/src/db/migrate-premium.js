const fs = require('fs');
const path = require('path');
const db = require('./connection');

async function migratePremiumUsers() {
  try {
    console.log('🔄 Starting premium users migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-premium-users.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await db.run(statement);
        console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
      } catch (error) {
        // Ignore "duplicate column" errors (already exists)
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️  Column already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Premium users migration completed successfully!');
    console.log('');
    console.log('New features added:');
    console.log('  - users.is_premium (INTEGER)');
    console.log('  - users.premium_expires_at (TEXT)');
    console.log('  - users.books_created_count (INTEGER)');
    console.log('  - premium_transactions table');
    console.log('  - ad_impressions table (optional analytics)');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migratePremiumUsers()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migratePremiumUsers };

