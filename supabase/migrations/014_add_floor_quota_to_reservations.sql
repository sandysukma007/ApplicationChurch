-- Add floor_quota_id column to reservations table
-- This enables quota-based booking (replacing seat-based booking)

-- 1. Add floor_quota_id column (nullable initially)
ALTER TABLE reservations
ADD COLUMN floor_quota_id UUID REFERENCES floor_quotas(id) ON DELETE SET NULL;

-- 2. Make seat_id nullable (since we now support both seat-based and quota-based reservations)
ALTER TABLE reservations
ALTER COLUMN seat_id DROP NOT NULL;

-- 3. Add index queries on floor_qu for fasterota_id
CREATE INDEX idx_reservations_floor_quota ON reservations(floor_quota_id);

-- 4. Create a check constraint to ensure either seat_id OR floor_quota_id is set
-- (but not both, and at least one)
ALTER TABLE reservations
ADD CONSTRAINT chk_reservation_type
CHECK (
  (seat_id IS NOT NULL AND floor_quota_id IS NULL) OR
  (seat_id IS NULL AND floor_quota_id IS NOT NULL)
);

-- 5. Update RLS policies if needed - existing policies should still work
-- The existing policies allow authenticated users to create/read/update reservations

-- 6. Grant execute permission for any new functions
GRANT SELECT ON reservations TO authenticated;
GRANT INSERT ON reservations TO authenticated;
GRANT UPDATE ON reservations TO authenticated;

-- Verify the foreign key was created
-- This will show the relationship between reservations and floor_quotas
