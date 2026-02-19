# TODO: Formulir Download Feature

## Tasks:
- [x] 1. Create Supabase migration for forms table
- [x] 2. Add Form type to src/types/index.ts
- [x] 3. Create file download utility
- [x] 4. Update KumpulanFormulirScreen to download functionality
- [ ] 5. Test download functionality


## Details:

### 1. Create Supabase Migration
- File: `supabase/migrations/010_create_forms_table.sql`
- Table: forms with fields: id, title, code, file_url, file_path, category, is_active, created_at, updated_at
- Insert initial data for Baptis Bayi form

### 2. Add Form Type
- Add Form interface to src/types/index.ts
- Add FormCategory type

### 3. Create File Download Utility
- File: `src/utils/fileDownload.ts`
- Handle PDF download and viewing

### 4. Update KumpulanFormulirScreen
- Change from navigation to download
- Hardcode Baptis Bayi PDF download
- Use download icon
- Keep other forms as "Segera Hadir"
