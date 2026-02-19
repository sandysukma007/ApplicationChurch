# TODO - Perbaikan Download Formulir Baptis Bayi

## Masalah
File download formulir tidak tersimpan meskipun notifikasi berhasil muncul.

## Analisis
Fungsi `handleDownload` hanya melakukan simulasi dengan `setTimeout` tanpa implementasi aktual untuk membuat dan menyimpan file.

## Solusi Implementasi
Menggunakan React Native Share API untuk membuat dan membagikan formulir dalam format HTML yang dapat di-print ke PDF atau disimpan ke Files.

## Perubahan yang Dilakukan

### 1. File: `src/screens/BaptisBayiFormScreen.tsx`
- [x] Tambahkan import `Share` dari 'react-native'
- [x] Buat fungsi `generateFormHTML()` untuk generate HTML template formulir
- [x] Modifikasi fungsi `handleDownload()` untuk menggunakan Share API
- [x] Hapus kode duplikat dan library native yang tidak diperlukan

### 2. File: `android/app/src/main/AndroidManifest.xml`
- [x] Hapus permission `WRITE_EXTERNAL_STORAGE` dan `READ_EXTERNAL_STORAGE` (tidak diperlukan untuk Share API)

### 3. Dependencies
- [x] Hapus library `react-native-html-to-pdf` (menyebabkan build error)
- [x] Hapus library `react-native-fs` (tidak diperlukan)
- [x] Hapus library `react-native-permissions` (tidak diperlukan)

## Cara Kerja Solusi
1. User mengisi formulir dan klik "Preview Formulir"
2. User klik "Download PDF" di halaman preview
3. Aplikasi generate HTML content dari data formulir
4. Share API menampilkan dialog share dengan opsi:
   - "Print to PDF" (untuk menyimpan sebagai PDF)
   - "Simpan ke Files" (untuk menyimpan sebagai HTML)
   - Share ke aplikasi lain (WhatsApp, Email, dll)

## Keuntungan Solusi Ini
- Tidak memerlukan library native tambahan
- Tidak ada masalah permission pada Android 10+
- User dapat memilih format penyimpanan (PDF via Print atau HTML)
- Dapat langsung share ke aplikasi lain

## Status Build
- [x] Kode perbaikan implementasi selesai
- [ ] Build Android berhasil (terkendala file lock di Windows, perlu restart/manual delete folder build)
- [ ] Testing di device/emulator

## Catatan Penting
Build saat ini gagal karena file `.cxx` dan `build` terkunci oleh proses Windows. Solusi:
1. Restart komputer, atau
2. Hapus manual folder `android/app/.cxx` dan `android/app/build` setelah menutup semua aplikasi
3. Jalankan build ulang dengan: `cd android && ./gradlew assembleDebug`

Kode perbaikan sudah siap dan tidak memerlukan library native tambahan.
