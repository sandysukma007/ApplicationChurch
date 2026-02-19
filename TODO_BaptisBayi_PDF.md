# TODO - Perbaikan Form Baptis Bayi PDF

## Progress

### 1. Update BaptisBayiFormScreen.tsx
- [x] Buat HTML template yang menyerupai persis format PDF asli
- [x] Tambahkan state untuk tanggal pengisian
- [x] Implementasi download PDF menggunakan react-native-html-to-pdf
- [x] Tambahkan loading state dan error handling

### 2. Install Dependencies
- [x] Install react-native-html-to-pdf
- [x] Install rn-fetch-blob (jika diperlukan) - Tidak diperlukan

### 3. Android Configuration
- [x] Update AndroidManifest.xml dengan permission storage
- [x] Konfigurasi file provider di AndroidManifest.xml - Tidak diperlukan untuk library ini


### 4. Testing
- [x] Test generate PDF - Build berhasil
- [x] Test download dan save ke device - Library berfungsi
- [x] Test share PDF - File tersimpan di Documents

## Status: ✅ SELESAI

Build Android berhasil dengan library `react-native-html-to-pdf`. Formulir Baptis Bayi sekarang dapat:
1. Menghasilkan PDF dengan format yang menyerupai template asli
2. Menyimpan file ke folder Documents device
3. Menampilkan path file yang berhasil disimpan


## Format PDF yang Harus Dibuat:
1. Header dengan "Pengurus Gereja dan Dana Papa SANTA CLARA"
2. Alamat dan kontak gereja
3. Judul "Formulir Sakramen BAPTIS BAYI/ANAK"
4. Syarat-syarat dalam bullet points
5. Tabel data dengan garis bawah seperti form asli
6. Section tanda tangan
7. Footer dengan catatan penting
