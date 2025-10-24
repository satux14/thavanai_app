# SQLite Migration

## Overview
Migrated the app from AsyncStorage to SQLite for better data management, performance, and relational data capabilities.

## What Changed

### 1. Database Structure
Created a proper relational database with 4 tables:

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

#### Books Table
```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  dl_no TEXT NOT NULL,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  address TEXT NOT NULL,
  loan_amount REAL NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users (id)
);
```

#### Entries Table
```sql
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  remaining REAL NOT NULL,
  signature TEXT,
  page_number INTEGER NOT NULL,
  serial_number INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
);
```

#### Book Shares Table
```sql
CREATE TABLE book_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  shared_with_user_id INTEGER NOT NULL,
  shared_at TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users (id),
  UNIQUE(book_id, shared_with_user_id)
);
```

### 2. New Files

#### `src/utils/database.js`
Core database module with:
- `initDatabase()` - Initialize DB and create tables
- `getDatabase()` - Get DB instance
- `closeDatabase()` - Close DB connection
- `clearAllData()` - Clear all data (testing)

#### Updated `src/utils/auth.js`
Now uses SQLite instead of AsyncStorage:
- `registerUser()` - Register new user
- `loginUser()` - Login user
- `findUserByUsername()` - Find user by username
- `findUserById()` - Find user by ID
- Password hashing with SHA-256

#### Updated `src/utils/storage.js`
Fully rewritten to use SQLite:
- Book CRUD operations with ownership
- Entry CRUD operations
- Book sharing functions:
  - `shareBook(bookId, username)` - Share book with debtor
  - `unshareBook(bookId, username)` - Revoke access
  - `getBookShares(bookId)` - Get all shares
- Automatic timestamp management
- Foreign key constraints for data integrity

### 3. Key Benefits

✅ **Better Performance**: SQLite is optimized for mobile apps
✅ **Data Integrity**: Foreign keys and constraints prevent data corruption
✅ **Transactions**: Atomic operations for data consistency
✅ **Relational Queries**: Easy to join data across tables
✅ **Scalability**: Can handle thousands of books and entries
✅ **Backup/Restore**: Can export/import the entire database file
✅ **No Data Size Limits**: Unlike AsyncStorage's 6MB limit

### 4. API Compatibility

All existing screen components work without changes! The API remains the same:
- `saveBook()` / `getAllBooks()` / `getBook()` / `updateBook()` / `deleteBook()`
- `saveEntry()` / `getEntries()` / `updateEntry()` / `deleteEntry()`

## Database Initialization

The database is automatically initialized when the app starts in `App.js`:

```javascript
useEffect(() => {
  initializeApp();
}, []);

const initializeApp = async () => {
  await initDatabase();
  // ... check login status
};
```

## Data Migration Notes

⚠️ **Important**: If you had data in AsyncStorage before this migration:
- Old data in AsyncStorage is NOT automatically migrated
- This is a fresh start with SQLite
- Users will need to re-register and create books again

If you need to migrate old data, you would need to:
1. Read data from AsyncStorage
2. Insert it into SQLite tables
3. Clean up AsyncStorage

## Sharing System

Books can now be shared between users:

```javascript
// Owner shares a book with debtor
await shareBook(bookId, 'debtor_username');

// Get all users a book is shared with
const shares = await getBookShares(bookId);

// Revoke access
await unshareBook(bookId, 'debtor_username');
```

The dashboard will show two sections:
- **My Books** - Books owned by the user
- **Shared with Me** - Books others have shared with the user

## Next Steps

Ready for Phase 2 of the authentication upgrade:
- ✅ User authentication system
- ✅ Book ownership and sharing (database ready)
- 🔜 QR code generation for daily entries
- 🔜 QR code scanner for debtors
- 🔜 Dashboard sections for owned and shared books

## Testing

To test the SQLite implementation:

```javascript
// In your code, you can access the database utilities:
import { clearAllData } from './src/utils/database';

// Clear all data to start fresh (useful during development)
await clearAllData();
```

## Technical Notes

- Database file: `thavanai.db` stored in app's local directory
- Password security: SHA-256 hashing (consider bcrypt for production)
- Session management: Currently uses global variable (consider AsyncStorage for persistence across app restarts)
- Dates stored as ISO 8601 strings for easy sorting and parsing
- IDs use timestamp + random string for uniqueness

