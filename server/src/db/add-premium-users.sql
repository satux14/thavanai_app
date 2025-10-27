-- Add premium user support and ad tracking
-- Run this migration to add premium user functionality

-- Add premium field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS books_created_count INTEGER DEFAULT 0;

-- Create premium transactions table (for tracking purchases)
CREATE TABLE IF NOT EXISTS premium_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    plan_type TEXT NOT NULL, -- 'monthly', 'yearly'
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_method TEXT, -- 'gpay', 'paytm', 'upi', 'card', etc.
    started_at TEXT,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ad impressions table (optional analytics)
CREATE TABLE IF NOT EXISTS ad_impressions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ad_type TEXT NOT NULL, -- 'banner', 'interstitial', 'app_open'
    screen_name TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_premium_transactions_user_id ON premium_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_transactions_status ON premium_transactions(status);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user_id ON ad_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_timestamp ON ad_impressions(timestamp);

-- Insert some example data (optional - remove in production)
-- UPDATE users SET is_premium = 0 WHERE id = 1; -- Make user non-premium for testing

