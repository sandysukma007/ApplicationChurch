-- Create masses table
CREATE TABLE public.masses (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NULL,
  date_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  pastor TEXT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT masses_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.masses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can do anything on masses" ON public.masses
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow public to select masses
CREATE POLICY "Public can select masses" ON public.masses
  FOR SELECT USING (true);

-- Create policy to allow service role to insert masses
CREATE POLICY "Service role can insert masses" ON public.masses
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Insert sample data
INSERT INTO public.masses (title, date_time) VALUES ('Misa Harian di Hari Sabtu Jam 5 Sore', '2024-12-14 17:00:00');
INSERT INTO public.masses (title, date_time) VALUES ('Misa Harian di Hari Minggu jam 6 pagi', '2024-12-15 06:00:00');
INSERT INTO public.masses (title, date_time) VALUES ('Misa Harian di Hari Minggu jam 9 pagi', '2024-12-15 09:00:00');
INSERT INTO public.masses (title, date_time) VALUES ('Misa Harian di Hari Minggu jam 5 sore', '2024-12-15 17:00:00');
