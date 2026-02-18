-- Fix: Ensure foreign key relationship exists between reservations and seats
-- This migration explicitly adds the foreign key if it's missing

-- First, let's check if the foreign key exists
-- If it doesn't exist, add it

-- Drop existing foreign key if it exists (to recreate properly)
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_seat_id_fkey;

-- Add foreign key constraint
ALTER TABLE reservations
ADD CONSTRAINT reservations_seat_id_fkey
FOREIGN KEY (seat_id)
REFERENCES seats(id)
ON DELETE CASCADE;

-- Also ensure mass_id foreign key exists
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_mass_id_fkey;

ALTER TABLE reservations
ADD CONSTRAINT reservations_mass_id_fkey
FOREIGN KEY (mass_id)
REFERENCES masses(id)
ON DELETE CASCADE;

-- Grant execute permission to authenticated users for the function
GRANT EXECUTE ON FUNCTION get_seat_availability TO authenticated;

-- Verify the foreign keys are in place
-- SELECT
--     tc.constraint_name,
--     tc.table_name,
--     kcu.column_name,
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
--   AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'reservations';
