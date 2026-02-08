-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email and code for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_code ON verification_codes (email, code);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes (expires_at);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can do anything" ON verification_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow authenticated users to insert their own codes (for forgot password)
CREATE POLICY "Users can insert their own verification codes" ON verification_codes
  FOR INSERT WITH CHECK (auth.email() = email);

-- Create policy to allow authenticated users to select their own codes
CREATE POLICY "Users can select their own verification codes" ON verification_codes
  FOR SELECT USING (auth.email() = email);
