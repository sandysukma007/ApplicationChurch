-- Fix mass_quotas current_booked based on actual reservations
-- This will calculate and update current_booked from existing reservations

-- Step mass 1: Update_quotas based on actual confirmed reservations
UPDATE mass_quotas mq
SET
  current_booked = COALESCE(
    (
      SELECT SUM(r.number_of_people)
      FROM reservations r
      WHERE r.mass_id = mq.mass_id
        AND r.floor_quota_id = mq.floor_quota_id
        AND r.status = 'confirmed'
    ),
    0
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM reservations r
  WHERE r.mass_id = mq.mass_id
    AND r.floor_quota_id = mq.floor_quota_id
    AND r.status = 'confirmed'
);

-- Step 2: Ensure mass_quotas with no reservations have current_booked = 0
UPDATE mass_quotas
SET current_booked = 0,
    updated_at = NOW()
WHERE current_booked IS NULL;

-- Step 3: Verify the trigger exists and recreate if needed
-- First check if trigger exists
DO $$
BEGIN
  -- Check if function exists and drop it
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_quota_on_reservation') THEN
    DROP FUNCTION update_quota_on_reservation() CASCADE;
  END IF;
END $$;

-- Create the corrected function
CREATE OR REPLACE FUNCTION update_quota_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update ONLY the specific floor_quota for this reservation
    UPDATE mass_quotas
    SET current_booked = current_booked + NEW.number_of_people,
        updated_at = NOW()
    WHERE mass_id = NEW.mass_id
      AND floor_quota_id = NEW.floor_quota_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- If floor_quota changed, update both old and new
    IF OLD.floor_quota_id != NEW.floor_quota_id THEN
      -- Decrement old floor_quota
      UPDATE mass_quotas
      SET current_booked = current_booked - OLD.number_of_people,
          updated_at = NOW()
      WHERE mass_id = OLD.mass_id
        AND floor_quota_id = OLD.floor_quota_id;

      -- Increment new floor_quota
      UPDATE mass_quotas
      SET current_booked = current_booked + NEW.number_of_people,
          updated_at = NOW()
      WHERE mass_id = NEW.mass_id
        AND floor_quota_id = NEW.floor_quota_id;
    ELSIF OLD.number_of_people != NEW.number_of_people THEN
      -- Only the number of people changed
      UPDATE mass_quotas
      SET current_booked = current_booked - OLD.number_of_people + NEW.number_of_people,
          updated_at = NOW()
      WHERE mass_id = NEW.mass_id
        AND floor_quota_id = NEW.floor_quota_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement when reservation is deleted/cancelled
    UPDATE mass_quotas
    SET current_booked = current_booked - OLD.number_of_people,
        updated_at = NOW()
    WHERE mass_id = OLD.mass_id
      AND floor_quota_id = OLD.floor_quota_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate the trigger (drop if exists first)
DROP TRIGGER IF EXISTS on_reservation_changed ON reservations;

CREATE TRIGGER on_reservation_changed
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_quota_on_reservation();

-- Step 5: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_quota_on_reservation TO authenticated;
