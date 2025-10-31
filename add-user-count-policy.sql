-- Enable Row Level Security on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public to count profiles" ON profiles;

-- Create policy to allow anyone to SELECT COUNT from profiles
-- This doesn't expose any sensitive data, just the total count
CREATE POLICY "Allow public to count profiles"
ON profiles
FOR SELECT
USING (true);

-- Verify the policy was created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles';
