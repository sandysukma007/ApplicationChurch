-- Create reservations table for seat booking
-- Each reservation is for a specific mass event and seat

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_id UUID NOT NULL REFERENCES masses(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number_of_people INTEGER NOT NULL CHECK (number_of_people BETWEEN 1 AND 10),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mass_id, seat_id) -- One reservation per seat per mass
);

-- Create indexes for faster queries
CREATE INDEX idx_reservations_mass ON reservations(mass_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_seat ON reservations(seat_id);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all reservations (for admin view)
CREATE POLICY "Allow authenticated users to read all reservations" ON reservations
  FOR SELECT TO authenticated
  USING (true);

-- Allow users to create their own reservations
CREATE POLICY "Allow users to create reservations" ON reservations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reservations
CREATE POLICY "Allow users to update their own reservations" ON reservations
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own reservations
CREATE POLICY "Allow users to delete their own reservations" ON reservations
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create function to get seat availability for a mass
-- This will be used in API to show available seats
CREATE OR REPLACE FUNCTION get_seat_availability(mass_id UUID)
RETURNS TABLE (
  seat_id UUID,
  column_name VARCHAR(1),
  row_number INTEGER,
  seat_number INTEGER,
  capacity INTEGER,
  booked_count INTEGER,
  available_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.column_name,
    s.row_number,
    s.seat_number,
    s.capacity,
    COALESCE(SUM(r.number_of_people), 0)::INTEGER AS booked_count,
    (s.capacity - COALESCE(SUM(r.number_of_people), 0))::INTEGER AS available_count
  FROM seats s
  LEFT JOIN reservations r ON r.seat_id = s.id AND r.mass_id = get_seat_availability.mass_id AND r.status = 'confirmed'
  GROUP BY s.id, s.column_name, s.row_number, s.seat_number, s.capacity
  ORDER BY s.column_name, s.row_number, s.seat_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_seat_availability TO authenticated;
