# Storage Permission Fix TODO

## Masalah
- Storage permission tidak muncul saat download
- App settings menunjukkan "No Permission Allowed"
- Perlu fix untuk Android 10+ (scoped storage)

## Rencana Perbaikan

### 1. Update AndroidManifest.xml ✅
- [x] Tambah MANAGE_EXTERNAL_STORAGE permission untuk Android 11+
- [x] Tambah maxSdkVersion untuk permission legacy (API 28)
- [x] Tambah preserveLegacyExternalStorage
- [x] Tambah POST_NOTIFICATIONS permission

### 2. Buat Permission Utility (src/utils/permissions.ts) ✅
- [x] Fungsi checkStoragePermission() - support Android 10+ scoped storage
- [x] Fungsi requestStoragePermission() dengan support Android 10+
- [x] Fungsi requestStoragePermissionWithExplanation() dengan alert penjelasan
- [x] Fungsi openSettings() untuk redirect ke app settings
- [x] Fungsi showPermissionDeniedAlert() untuk handling denied permission
- [x] Fungsi checkAndRequestAllPermissions() untuk startup check

### 3. Update fileDownload.ts ✅
- [x] Gunakan permission utility baru
- [x] Tambah better error handling
- [x] Support scoped storage untuk Android 10+
- [x] Hapus fungsi requestStoragePermission() yang lama

### 4. Update KumpulanFormulirScreen.tsx ✅
- [x] Tambah permission check sebelum download
- [x] Gunakan directory yang proper (RNFS.DocumentDirectoryPath)
- [x] Import permission utility
- [x] Tambah Platform check untuk iOS/Android

### 5. Tambah Permission Request di App Startup ✅
- [x] Tambah permission check di SplashScreen.tsx
- [x] Tampilkan status permission di splash screen
- [x] Auto-request permission setelah 1 detik
- [x] Tidak block app jika permission ditolak (ask again saat download)

## File yang Diedit ✅
- [x] android/app/src/main/AndroidManifest.xml
- [x] src/utils/permissions.ts (baru)
- [x] src/utils/fileDownload.ts
- [x] src/screens/KumpulanFormulirScreen.tsx
- [x] src/screens/SplashScreen.tsx

## Testing (Pending)
- [ ] Test di Android 10, 11, 12, 13+
- [ ] Verifikasi permission dialog muncul saat startup
- [ ] Verifikasi permission dialog muncul saat download
- [ ] Pastikan PDF bisa di-download dan dibuka
- [ ] Test scenario: user menolak permission di startup
- [ ] Test scenario: user menolak permission saat download

## Cara Build & Test
```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Rebuild
npx react-native run-android

# Atau build release
cd android && ./gradlew assembleRelease
```

## Penjelasan Perubahan

### AndroidManifest.xml
- `WRITE_EXTERNAL_STORAGE` dan `READ_EXTERNAL_STORAGE` sekarang hanya untuk API 28 ke bawah (Android 9)
- `MANAGE_EXTERNAL_STORAGE` untuk Android 11+ (API 30+)
- `preserveLegacyExternalStorage` untuk migrasi data lama
- `POST_NOTIFICATIONS` untuk notifikasi download (Android 13+)

### Scoped Storage (Android 10+)
- Di Android 10+, aplikasi tidak perlu permission untuk akses app-specific directories
- PDF disimpan di `RNFS.DocumentDirectoryPath` (internal app storage)
- User tetap bisa akses file via Share atau Open

### Permission Flow
1. **Startup**: SplashScreen cek permission, tampilkan alert penjelasan
2. **Download**: Cek permission lagi, kalau belum granted minta lagi
3. **Denied**: Tampilkan alert dengan tombol ke Settings
