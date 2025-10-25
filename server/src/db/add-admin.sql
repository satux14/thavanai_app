-- Add admin role to users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- Add status to users table
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

