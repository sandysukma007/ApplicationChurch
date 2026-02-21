# TODO: Fix Booking Capacity Issues

## Issues:
1. Capacity doesn't decrease in Supabase
2. Each mass should have separate capacity (already correct in DB, verify implementation)
3. Button text "Sudah Booking di Jadwal Lain" - already in MassesScreen, verify BookingScreen

## Tasks:
- [x] 1. Create migration to initialize mass_quotas for all masses (supabase/migrations/016_initialize_mass_quotas.sql)
- [x] 2. Add message in BookingScreen when user has reservation on same date (different mass)
- [x] 3. Add styling for the same date reservation message

## Summary of Changes:
1. Created migration 016 to initialize mass_quotas for all existing masses and auto-create them for new masses
2. Updated BookingScreen.tsx to show warning message when user has reservation on same date at different mass schedule
3. Added proper styling for the warning message
