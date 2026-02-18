# Seat Booking Feature - TODO List

## Phase 1: Database Schema
- [x] Create SQL migration for seats table
- [x] Create SQL migration for reservations table
- [x] Add RLS policies for the new tables

## Phase 2: TypeScript Types
- [x] Add Seat type
- [x] Add Reservation type
- [x] Add SeatAvailability type

## Phase 3: API Functions
- [x] Add getSeatAvailability function
- [x] Add getReservationsByMass function
- [x] Add getUserReservationForMass function
- [x] Add createReservation function
- [x] Add cancelReservation function

## Phase 4: Booking Screen
- [x] Create BookingScreen.tsx with seat layout
- [x] Implement seat selection logic
- [x] Implement reservation form

## Phase 5: Navigation & Integration
- [x] Add Booking route to MainNavigator
- [x] Add booking button to MassesScreen
