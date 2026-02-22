-- Fix RLS policy for mass_quotas to allow trigger to update quotas
-- The trigger needs to update mass_quotas when reservations are created/updated/deleted

-- Enable RLS on mass_quotas if not already enabled (it should be from previous migration)
ALTER TABLE mass_quotas ENABLE ROW LEVEL SECURITY;

-- Add UPDATE policy for authenticated users (needed for the trigger to work)
-- The trigger runs as the user who made the reservation, so we need to allow updates
CREATE POLICY "Allow authenticated users to update mass_quotas" ON mass_quotas
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also add DELETE policy for consistency (in case there's a need to delete quotas)
CREATE POLICY "Allow authenticated users to delete mass_quotas" ON mass_quotas
  FOR DELETE TO authenticated
  USING (auth.role() = 'authenticated');

-- Grant permission to execute the trigger function
GRANT EXECUTE ON FUNCTION update_quota_on_reservation() TO authenticated;

-- Also grant update permission directly to authenticated users for the manual fallback in the app
GRANT UPDATE ON mass_quotas TO authenticated;
