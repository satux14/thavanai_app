-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  preferred_language TEXT DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  dl_no TEXT,
  name TEXT NOT NULL,
  father_name TEXT,
  address TEXT,
  loan_amount REAL NOT NULL,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'active',
  background_color TEXT,
  background_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Entries Table
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  serial_number INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  date TEXT,
  amount REAL,
  remaining REAL,
  signature_status TEXT DEFAULT 'none',
  signature_requested_by INTEGER,
  signed_by INTEGER,
  signed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (signature_requested_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (signed_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(book_id, serial_number)
);

-- Book Shares Table
CREATE TABLE IF NOT EXISTS book_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  shared_with_user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(book_id, shared_with_user_id)
);

-- Book Pages Metadata Table
CREATE TABLE IF NOT EXISTS book_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  max_page INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(book_id)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_books_owner ON books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_entries_book ON entries(book_id);
CREATE INDEX IF NOT EXISTS idx_entries_serial ON entries(book_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_shares_book ON book_shares(book_id);
CREATE INDEX IF NOT EXISTS idx_shares_user ON book_shares(shared_with_user_id);

