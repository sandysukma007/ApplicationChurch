# TODO: Booking Screen Layout Update

## Task: Perbaiki Layout Grid untuk Booking Screen
- Altar posisi atas (sudah ada)
- 3 Kolom (A, B, C) - sudah ada
- 10 Baris per kolom (perlu diubah dari 2 baris)
- 10 Space Bangku per baris (sudah ada)
- Layar bisa di-drag (sudah ada)

## Steps:
- [ ] 1. Update database migration (006_create_seats_table.sql)
  - [ ] Change row_number CHECK constraint from (1,2) to (1-10)
  - [ ] Update INSERT to include rows 1-10
- [ ] 2. Update BookingScreen.tsx
  - [ ] Change ROWS constant from [1, 2] to [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  - [ ] Update findAdjacentSeats to handle 10 rows

## Status: PENDING
