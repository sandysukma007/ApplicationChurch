-- Create floor_quotas table for quota-based booking system
-- Each floor has a configurable quota capacity

CREATE TABLE IF NOT EXISTS floor_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_name VARCHAR(50) NOT NULL,
  floor_number INTEGER NOT NULL CHECK (floor_number BETWEEN 1 AND 10),
  capacity INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(floor_number)
);

-- Create index for faster queries
CREATE INDEX idx_floor_quotas_floor_number ON floor_quotas(floor_number);

-- Insert default floor quotas (configurable)
INSERT INTO floor_quotas (floor_name, floor_number, capacity, description) VALUES
('Lantai 1', 1, 500, 'Lantai utama gereja - kapasitas 500 orang'),
('Lantai 2', 2, 200, 'Lantai mezzanine/gallery - kapasitas 200 orang')
ON CONFLICT (floor_number) DO NOTHING;

-- Enable RLS
ALTER TABLE floor_quotas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to floor quotas
CREATE POLICY "Allow public read access to floor_quotas" ON floor_quotas
  FOR SELECT USING (true);

-- Allow authenticated users to manage their own data
CREATE POLICY "Service role can manage floor_quotas" ON floor_quotas
  FOR ALL USING (auth.role() = 'service_role');
