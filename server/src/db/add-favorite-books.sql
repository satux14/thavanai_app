-- Add favorite field to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_favorite INTEGER DEFAULT 0;

-- Create index for faster sorting by favorite
CREATE INDEX IF NOT EXISTS idx_books_favorite ON books (is_favorite DESC, updated_at DESC);

