-- Create mass_quotas table to track quota usage per mass per floor
-- Links masses to floor quotas and tracks current usage

CREATE TABLE IF NOT EXISTS mass_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_id UUID NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
  floor_quota_id UUID NOT NULL REFERENCES floor_quotas(id) ON DELETE CASCADE,
  current_booked INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mass_id, floor_quota_id)
);

-- Create index for faster queries
CREATE INDEX idx_mass_quotas_mass_id ON mass_quotas(mass_id);
CREATE INDEX idx_mass_quotas_floor_quota_id ON mass_quotas(floor_quota_id);

-- Enable RLS
ALTER TABLE mass_quotas ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to mass_quotas" ON mass_quotas
  FOR SELECT USING (true);

-- Allow authenticated users to manage their own data
CREATE POLICY "Service role can manage mass_quotas" ON mass_quotas
  FOR ALL USING (auth.role() = 'service_role');

-- Function to initialize mass_quotas when a mass is created
CREATE OR REPLACE FUNCTION init_mass_quotas()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert quota entries for all active floors
  INSERT INTO mass_quotas (mass_id, floor_quota_id, current_booked)
  SELECT NEW.id, id, 0
  FROM floor_quotas
  WHERE is_active = true
  ON CONFLICT (mass_id, floor_quota_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize mass_quotas when a new mass is created
CREATE TRIGGER on_mass_created
  AFTER INSERT ON masses
  FOR EACH ROW
  EXECUTE FUNCTION init_mass_quotas();

-- Function to update current_booked when reservation is made
CREATE OR REPLACE FUNCTION update_quota_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mass_quotas
    SET current_booked = current_booked + NEW.number_of_people,
        updated_at = NOW()
    WHERE mass_id = NEW.mass_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.mass_id != NEW.mass_id THEN
    -- If mass changed, decrement old and increment new
    UPDATE mass_quotas
    SET current_booked = current_booked - OLD.number_of_people,
        updated_at = NOW()
    WHERE mass_id = OLD.mass_id;

    UPDATE mass_quotas
    SET current_booked = current_booked + NEW.number_of_people,
        updated_at = NOW()
    WHERE mass_id = NEW.mass_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mass_quotas
    SET current_booked = current_booked - OLD.number_of_people,
        updated_at = NOW()
    WHERE mass_id = OLD.mass_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update mass_quotas when reservation is made/cancelled/updated
CREATE TRIGGER on_reservation_changed
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_quota_on_reservation();
