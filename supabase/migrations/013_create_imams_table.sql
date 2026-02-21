-- Create imams table for storing imam/priest profiles
-- This table replaces the pastor field in masses

CREATE TABLE IF NOT EXISTS imams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  religious_order VARCHAR(100),
  title VARCHAR(50),
  status TEXT DEFAULT 'active',
  position VARCHAR(100),
  address TEXT,
  birth_place VARCHAR(100),
  birth_date DATE,
  ordination_date DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_imams_status ON imams(status);
CREATE INDEX idx_imams_full_name ON imams(full_name);

-- Enable RLS
ALTER TABLE imams ENABLE ROW LEVEL SECURITY;

-- Allow public read access to imams
CREATE POLICY "Allow public read access to imams" ON imams
  FOR SELECT USING (true);

-- Allow authenticated users to manage their own data
CREATE POLICY "Service role can manage imams" ON imams
  FOR ALL USING (auth.role() = 'service_role');

-- Add imam_id column to masses table
ALTER TABLE masses ADD COLUMN IF NOT EXISTS imam_id UUID REFERENCES imams(id) ON DELETE SET NULL;

-- Create index for mass -> imam relationship
CREATE INDEX idx_masses_imam_id ON masses(imam_id);

-- Insert sample imams data (optional - can be customized)
INSERT INTO imams (full_name, religious_order, title, status, position, address) VALUES
('Pastor Robertus Setiawan, OFM', 'Ordo Friar Minor (OFM)', 'Pastor', 'active', 'Pastor Kepala', 'Gereja Santa Clara Bekasi'),
('Pastor Antonius Budi, OFM', 'Ordo Friar Minor (OFM)', 'Pastor', 'active', 'Pastor Pembantu I', 'Gereja Santa Clara Bekasi'),
('Pastor Maria Goretti, SVD', 'Societas Verbi Divini (SVD)', 'Pastor', 'active', 'Pastor Pembantu II', 'Gereja Santa Clara Bekasi')
ON CONFLICT DO NOTHING;
