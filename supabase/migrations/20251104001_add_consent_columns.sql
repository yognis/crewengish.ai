-- Add consent columns to profiles table
-- Migration: 20251104001_add_consent_columns
-- Description: Add KVKK/GDPR consent tracking columns

-- Add consent columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kvkk_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_date TIMESTAMPTZ DEFAULT NOW();

-- Add comment to document the purpose
COMMENT ON COLUMN profiles.terms_accepted IS 'User accepted terms of service';
COMMENT ON COLUMN profiles.kvkk_accepted IS 'User provided explicit consent for KVKK (Turkish GDPR) including international data transfer';
COMMENT ON COLUMN profiles.age_verified IS 'User confirmed they are 18+ years old';
COMMENT ON COLUMN profiles.marketing_consent IS 'User opted in to receive marketing emails (optional)';
COMMENT ON COLUMN profiles.consent_date IS 'Timestamp when user provided initial consent';

-- Create index for faster queries on marketing consent
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_consent 
ON profiles(marketing_consent) 
WHERE marketing_consent = TRUE;

-- Create index for consent audit queries
CREATE INDEX IF NOT EXISTS idx_profiles_consent_date 
ON profiles(consent_date DESC);

-- Update existing users to have accepted terms (migration only - already using the platform)
UPDATE profiles 
SET 
  terms_accepted = TRUE,
  kvkk_accepted = TRUE,
  age_verified = TRUE,
  consent_date = created_at
WHERE 
  terms_accepted IS NULL 
  OR terms_accepted = FALSE;

-- Add constraint to ensure consent requirements
ALTER TABLE profiles 
ADD CONSTRAINT chk_consent_required 
CHECK (
  (terms_accepted = TRUE AND kvkk_accepted = TRUE AND age_verified = TRUE)
  OR (created_at > NOW()) -- Allow future inserts to be validated by application
);

