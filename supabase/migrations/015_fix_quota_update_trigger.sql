-- Fix the trigger to correctly update only the specific floor_quota
-- The previous trigger was updating ALL mass_quotas for a mass instead of just the specific floor

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_reservation_changed ON reservations;
DROP FUNCTION IF EXISTS update_quota_on_reservation();

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

-- Create the trigger
CREATE TRIGGER on_reservation_changed
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_quota_on_reservation();
