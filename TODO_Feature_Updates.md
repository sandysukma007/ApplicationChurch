# TODO: Feature Updates

## Task 1: Tampilkan Booking Misa di HomeScreen ✅
- [x] 1.1 Update HomeScreen.tsx to fetch user's reservations
- [x] 1.2 Add a new section to display user's upcoming reservations
- [x] 1.3 Show reservation details (mass title, date, floor, number of people)

## Task 2: Tampilkan Romo yang Memimpin Misa ✅
- [x] 2.1 Update MassesScreen.tsx to display imam data from getMassesWithImam
- [x] 2.2 Use imam.full_name or imam.title in the pastor section
- [x] 2.3 Handle cases where imam data might be null

## Task 3: Tampilkan Countdown/Warning Sebelum Misa ✅
- [x] 3.1 Add countdown logic in HomeScreen to calculate time until mass
- [x] 3.2 Create a warning notification component
- [x] 3.3 Show different messages based on time remaining:
    - Less than 1 hour: "Misa dimulai dalam X menit"
    - Less than 24 hours: "Misa dimulai dalam X jam"
    - More than 24 hours: "Misa dimulai dalam X hari"
