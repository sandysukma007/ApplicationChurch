-- Create seats table for seat booking system
-- Layout: 3 columns (A, B, C) × 2 rows (1, 2) × 10 seats = 60 seats total

CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_name VARCHAR(1) NOT NULL CHECK (column_name IN ('A', 'B', 'C')),
  row_number INTEGER NOT NULL CHECK (row_number IN (1, 2)),
  seat_number INTEGER NOT NULL CHECK (seat_number BETWEEN 1 AND 10),
  capacity INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(column_name, row_number, seat_number)
);

-- Create index for faster queries
CREATE INDEX idx_seats_location ON seats(column_name, row_number, seat_number);

-- Insert all 60 seats (3 columns × 2 rows × 10 seats)
INSERT INTO seats (column_name, row_number, seat_number, capacity) VALUES
-- Column A (Kiri)
('A', 1, 1, 10), ('A', 1, 2, 10), ('A', 1, 3, 10), ('A', 1, 4, 10), ('A', 1, 5, 10),
('A', 1, 6, 10), ('A', 1, 7, 10), ('A', 1, 8, 10), ('A', 1, 9, 10), ('A', 1, 10, 10),
('A', 2, 1, 10), ('A', 2, 2, 10), ('A', 2, 3, 10), ('A', 2, 4, 10), ('A', 2, 5, 10),
('A', 2, 6, 10), ('A', 2, 7, 10), ('A', 2, 8, 10), ('A', 2, 9, 10), ('A', 2, 10, 10),
-- Column B (Tengah)
('B', 1, 1, 10), ('B', 1, 2, 10), ('B', 1, 3, 10), ('B', 1, 4, 10), ('B', 1, 5, 10),
('B', 1, 6, 10), ('B', 1, 7, 10), ('B', 1, 8, 10), ('B', 1, 9, 10), ('B', 1, 10, 10),
('B', 2, 1, 10), ('B', 2, 2, 10), ('B', 2, 3, 10), ('B', 2, 4, 10), ('B', 2, 5, 10),
('B', 2, 6, 10), ('B', 2, 7, 10), ('B', 2, 8, 10), ('B', 2, 9, 10), ('B', 2, 10, 10),
-- Column C (Kanan)
('C', 1, 1, 10), ('C', 1, 2, 10), ('C', 1, 3, 10), ('C', 1, 4, 10), ('C', 1, 5, 10),
('C', 1, 6, 10), ('C', 1, 7, 10), ('C', 1, 8, 10), ('C', 1, 9, 10), ('C', 1, 10, 10),
('C', 2, 1, 10), ('C', 2, 2, 10), ('C', 2, 3, 10), ('C', 2, 4, 10), ('C', 2, 5, 10),
('C', 2, 6, 10), ('C', 2, 7, 10), ('C', 2, 8, 10), ('C', 2, 9, 10), ('C', 2, 10, 10)
ON CONFLICT (column_name, row_number, seat_number) DO NOTHING;

-- Enable RLS
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to seats
CREATE POLICY "Allow public read access to seats" ON seats
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete their own reservations
-- (handled by reservations table policy)
