-- Create forms table for storing form templates and documents
-- This table will store information about available forms for download

CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE, -- Form code like "FSakr-KAJ-2017-B/001"
  description TEXT,
  file_url TEXT, -- URL to the file (can be local or remote)
  file_path TEXT, -- Local file path if stored in app
  file_name VARCHAR(255), -- Original file name
  category VARCHAR(100), -- Category like "Sakramen", "Administrasi", "Perkawinan"
  icon VARCHAR(50) DEFAULT 'description', -- Material icon name
  gradient_colors TEXT[] DEFAULT ARRAY['#4299e1', '#3182ce'], -- Gradient colors for UI
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0, -- For ordering forms in the list
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_forms_category ON forms(category);
CREATE INDEX idx_forms_is_active ON forms(is_active);
CREATE INDEX idx_forms_sort_order ON forms(sort_order);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active forms
CREATE POLICY "Allow authenticated users to read active forms" ON forms
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Allow admin users to manage forms
CREATE POLICY "Allow admin users to manage forms" ON forms
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert initial form data for Baptis Bayi (hardcoded for now)
INSERT INTO forms (title, code, description, file_path, file_name, category, icon, gradient_colors, sort_order, is_active)
VALUES (
  'FORM SAKRAMEN BAPTIS BAYI',
  'FSakr-KAJ-2017-B/001',
  'Formulir pendaftaran sakramen baptis untuk bayi dan anak berusia maksimal 7 tahun',
  'src/docs/FORM01 - SAKRAMEN BAPTIS BAYI.pdf',
  'FORM01 - SAKRAMEN BAPTIS BAYI.pdf',
  'Sakramen',
  'child-care',
  ARRAY['#4299e1', '#3182ce'],
  1,
  true
);

-- Insert placeholder forms for future (coming soon)
INSERT INTO forms (title, code, description, category, icon, gradient_colors, sort_order, is_active) VALUES
  ('FORM CALON KATEKUMEN', NULL, 'Formulir pendaftaran calon katekumen', 'Sakramen', 'school', ARRAY['#48bb78', '#38a169'], 2, false),
  ('FORM BAPTIS DARURAT', NULL, 'Formulir baptis dalam keadaan darurat', 'Sakramen', 'emergency', ARRAY['#f56565', '#e53e3e'], 3, false),
  ('FORM PERNYATAAN MEMBERI IZIN ANAK UNTUK MENJADI KATOLIK', NULL, 'Formulir pernyataan izin orang tua', 'Sakramen', 'assignment', ARRAY['#ed8936', '#dd6b20'], 4, false),
  ('FORM KOMUNI PERTAMA', NULL, 'Formulir pendaftaran komuni pertama', 'Sakramen', 'restaurant', ARRAY['#9f7aea', '#805ad5'], 5, false),
  ('FORM SAKRAMEN PENGUATAN', NULL, 'Formulir pendaftaran sakramen penguatan', 'Sakramen', 'verified-user', ARRAY['#38b2ac', '#319795'], 6, false),
  ('FORM PENDAFTARAN PERKAWINAN', NULL, 'Formulir pendaftaran perkawinan', 'Perkawinan', 'favorite', ARRAY['#ed64a6', '#d53f8c'], 7, false),
  ('FORM SURAT PENGANTAR LINGKUNGAN', NULL, 'Formulir surat pengantar dari lingkungan', 'Administrasi', 'mail', ARRAY['#667eea', '#5a67d8'], 8, false),
  ('FORM SURAT KETERANGAN DOMISILI', NULL, 'Formulir surat keterangan domisili', 'Administrasi', 'home', ARRAY['#48bb78', '#38a169'], 9, false),
  ('FORM SAKSI PERKAWINAN', NULL, 'Formulir saksi perkawinan', 'Perkawinan', 'person-pin', ARRAY['#fbbf24', '#d69e2e'], 10, false),
  ('FORM MEMBANGUN RUMAH TANGGA', NULL, 'Formulir konseling membangun rumah tangga', 'Perkawinan', 'family-restroom', ARRAY['#f687b3', '#ed64a6'], 11, false),
  ('FORM LAPORAN SAKRAMEN PENGURAPAN', NULL, 'Formulir laporan sakramen pengurapan', 'Sakramen', 'local-hospital', ARRAY['#fc8181', '#e53e3e'], 12, false),
  ('FORM LAPORAN KEMATIAN', NULL, 'Formulir laporan kematian umat', 'Sakramen', 'sentiment-dissatisfied', ARRAY['#718096', '#4a5568'], 13, false),
  ('FORM PINDAH DOMISILI KK', NULL, 'Formulir pindah domisili kartu keluarga gereja', 'Administrasi', 'swap-horiz', ARRAY['#4299e1', '#3182ce'], 14, false),
  ('FORM PENAMBAHAN ANGGOTA KK', NULL, 'Formulir penambahan anggota kartu keluarga', 'Administrasi', 'person-add', ARRAY['#48bb78', '#38a169'], 15, false),
  ('FORM CETAK ULANG KK', NULL, 'Formulir cetak ulang kartu keluarga gereja', 'Administrasi', 'replay', ARRAY['#ed8936', '#dd6b20'], 16, false),
  ('FORM PERUBAHAN BIODATA KK', NULL, 'Formulir perubahan biodata kartu keluarga', 'Administrasi', 'edit', ARRAY['#9f7aea', '#805ad5'], 17, false);

-- Create function to get active forms
CREATE OR REPLACE FUNCTION get_active_forms()
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  code VARCHAR,
  description TEXT,
  file_url TEXT,
  file_path TEXT,
  file_name VARCHAR,
  category VARCHAR,
  icon VARCHAR,
  gradient_colors TEXT[],
  is_active BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.code,
    f.description,
    f.file_url,
    f.file_path,
    f.file_name,
    f.category,
    f.icon,
    f.gradient_colors,
    f.is_active,
    f.sort_order
  FROM forms f
  WHERE f.is_active = true
  ORDER BY f.sort_order ASC, f.title ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_active_forms() TO authenticated;
