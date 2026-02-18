# Booking Screen Update Plan

## Task Summary
Update BookingScreen to:
1. Move altar to the TOP (above seat layout)
2. Divide into 3 columns (A, B, C) like movie theater
3. Make seat selection horizontally scrollable

## Changes to be made in `src/screens/BookingScreen.tsx`:

### 1. Move Altar to TOP
- Remove altar from right side (altarContainer)
- Add altar at the top, above the seat layout

### 2. 3-Column Layout (Movie Theater Style)
- Keep columns A, B, C
- Each column shows seats 1-10 vertically
- This creates a movie theater-like appearance

### 3. Horizontal Scroll for Seat Selection
- Replace vertical ScrollView with horizontal ScrollView
- Allow horizontal swiping to browse seats
