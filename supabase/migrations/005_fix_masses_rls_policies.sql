-- Fix RLS policies for masses table to allow public read access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can do anything on masses" ON public.masses;
DROP POLICY IF EXISTS "Public can select masses" ON public.masses;
DROP POLICY IF EXISTS "Service role can insert masses" ON public.masses;

-- Create a simple policy to allow public read access
CREATE POLICY "Allow public read access to masses" ON public.masses
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert masses" ON public.masses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update masses" ON public.masses
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete masses" ON public.masses
  FOR DELETE USING (auth.role() = 'authenticated');
