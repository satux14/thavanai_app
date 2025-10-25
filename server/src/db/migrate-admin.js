const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../../data/thavanai.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding admin role and status to users table...');

db.serialize(() => {
  // Check if role column exists
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      return;
    }
    
    const hasRole = columns.some(col => col.name === 'role');
    const hasStatus = columns.some(col => col.name === 'status');
    
    if (!hasRole) {
      console.log('Adding role column...');
      db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
        if (err) console.error('Error adding role column:', err);
        else console.log('✓ Role column added');
      });
    } else {
      console.log('✓ Role column already exists');
    }
    
    if (!hasStatus) {
      console.log('Adding status column...');
      db.run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'", (err) => {
        if (err) console.error('Error adding status column:', err);
        else console.log('✓ Status column added');
      });
    } else {
      console.log('✓ Status column already exists');
    }
    
    // Create indexes
    setTimeout(() => {
      db.run("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)", (err) => {
        if (err) console.error('Error creating role index:', err);
      });
      
      db.run("CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)", (err) => {
        if (err) console.error('Error creating status index:', err);
      });
      
      // Create default admin user if none exists
      db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", async (err, result) => {
        if (err) {
          console.error('Error checking admin users:', err);
          db.close();
          return;
        }
        
        if (result.count === 0) {
          console.log('\n🔐 No admin user found. Creating default admin...');
          console.log('Username: admin');
          console.log('Password: admin123');
          console.log('⚠️  IMPORTANT: Please change this password after first login!\n');
          
          const hashedPassword = await bcrypt.hash('admin123', 10);
          
          db.run(
            "INSERT INTO users (username, password, full_name, role, status, preferred_language) VALUES (?, ?, ?, ?, ?, ?)",
            ['admin', hashedPassword, 'Administrator', 'admin', 'active', 'en'],
            (err) => {
              if (err) {
                console.error('Error creating admin user:', err);
              } else {
                console.log('✓ Default admin user created successfully');
              }
              
              console.log('\n✅ Admin migration complete!');
              db.close();
            }
          );
        } else {
          console.log(`✓ Found ${result.count} admin user(s)`);
          console.log('\n✅ Admin migration complete!');
          db.close();
        }
      });
    }, 500);
  });
});

