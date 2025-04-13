-- Ensure the users table has all required fields for the leaderboard
ALTER TABLE users
  -- Add first_name if it doesn't exist
  ADD COLUMN IF NOT EXISTS first_name text,
  -- Add last_name if it doesn't exist
  ADD COLUMN IF NOT EXISTS last_name text,
  -- Add created_at if it doesn't exist
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Create an index on created_at for better performance when sorting
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);

-- Add a comment to the table
COMMENT ON TABLE users IS 'Stores user information for the SyllabAI application'; 
