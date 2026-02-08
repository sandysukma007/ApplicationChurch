-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  gender TEXT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  birth_date DATE NULL,
  baptism_date DATE NULL,
  address TEXT NULL,
  phone TEXT NULL,
  parish TEXT NULL DEFAULT 'Paroki Santa Clara',
  family_card_number TEXT NULL,
  region TEXT NULL,
  community TEXT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can do anything on profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow users to select their own profile
CREATE POLICY "Users can select their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
