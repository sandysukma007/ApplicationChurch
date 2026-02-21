-- Initialize mass_quotas for all existing masses
-- This ensures each mass has quota tracking for each floor

-- Insert mass_quotas for each mass and floor combination
-- Only insert if it doesn't already exist
INSERT INTO mass_quotas (mass_id, floor_quota_id, current_booked)
SELECT
    m.id as mass_id,
    fq.id as floor_quota_id,
    0 as current_booked
FROM masses m
CROSS JOIN floor_quotas fq
WHERE fq.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM mass_quotas mq
    WHERE mq.mass_id = m.id
    AND mq.floor_quota_id = fq.id
);

-- Create function to auto-create mass_quotas when new mass is added
CREATE OR REPLACE FUNCTION create_mass_quotas_for_new_mass()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert mass_quotas for each active floor
    INSERT INTO mass_quotas (mass_id, floor_quota_id, current_booked)
    SELECT
        NEW.id as mass_id,
        fq.id as floor_quota_id,
        0 as current_booked
    FROM floor_quotas fq
    WHERE fq.is_active = true
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger for auto-creating mass_quotas
DROP TRIGGER IF EXISTS trigger_create_mass_quotas ON masses;
CREATE TRIGGER trigger_create_mass_quotas
    AFTER INSERT ON masses
    FOR EACH ROW
    EXECUTE FUNCTION create_mass_quotas_for_new_mass();
