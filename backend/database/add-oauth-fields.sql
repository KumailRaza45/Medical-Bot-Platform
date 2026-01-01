-- Add OAuth fields to users table
-- Run this in your Supabase SQL Editor

-- Make password_hash nullable for OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Create index for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

-- Update existing users to have email_verified = true
UPDATE users SET email_verified = true WHERE email_verified IS NULL;

COMMENT ON COLUMN users.oauth_provider IS 'OAuth provider name (google, facebook, apple)';
COMMENT ON COLUMN users.oauth_id IS 'Unique ID from OAuth provider';
COMMENT ON COLUMN users.profile_picture IS 'URL to user profile picture from OAuth provider';
COMMENT ON COLUMN users.email_verified IS 'Whether email has been verified';
