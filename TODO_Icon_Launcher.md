# TODO: Mengubah Icon Launcher APK

## Status: ⏳ PENDING - Perlu konversi manual logo

## Instruksi Mengubah Icon Launcher

### 1. Persiapkan Logo
Logo saat ini ada di: `src/assets/Logo-Santa-Clara-Bekasi-Transparant.png`

### 2. Konversi Logo ke Berbagai Ukuran

Anda perlu mengkonversi logo menjadi 5 ukuran berbeda untuk Android:

| Folder | Ukuran | File |
|--------|--------|------|
| mipmap-mdpi | 48x48 px | ic_launcher.png, ic_launcher_round.png |
| mipmap-hdpi | 72x72 px | ic_launcher.png, ic_launcher_round.png |
| mipmap-xhdpi | 96x96 px | ic_launcher.png, ic_launcher_round.png |
| mipmap-xxhdpi | 144x144 px | ic_launcher.png, ic_launcher_round.png |
| mipmap-xxxhdpi | 192x192 px | ic_launcher.png, ic_launcher_round.png |

### 3. Cara Konversi (Pilih salah satu):

#### Opsi A: Menggunakan Android Studio (Recommended)
1. Buka Android Studio
2. Klik kanan pada folder `res` → New → Image Asset
3. Pilih "Launcher Icons (Adaptive and Legacy)"
4. Upload logo PNG di "Foreground Layer"
5. Atur background color (misal: putih atau warna tema gereja)
6. Klik Next → Finish
7. Android Studio akan otomatis generate semua ukuran

#### Opsi B: Menggunakan Website Online
1. Kunjungi: https://appicon.co/ atau https://makeappicon.com/
2. Upload logo PNG
3. Download hasilnya
4. Extract dan copy ke folder mipmap yang sesuai

#### Opsi C: Manual dengan Photoshop/GIMP
1. Buka logo di Photoshop/GIMP
2. Resize ke 5 ukuran di atas
3. Simpan sebagai PNG dengan nama yang sesuai
4. Copy ke folder mipmap

### 4. Lokasi File Icon

Setelah dikonversi, copy file ke:
```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png (192x192)
```

### 5. Rebuild APK

Setelah mengganti icon, rebuild APK:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## Permission Storage - SUDAH DIUPDATE ✅

### Perubahan yang sudah dilakukan:

1. **AndroidManifest.xml** - Ditambahkan:
   - `READ_MEDIA_IMAGES` (Android 13+)
   - `READ_MEDIA_VIDEO` (Android 13+)
   - `READ_MEDIA_AUDIO` (Android 13+)
   - `READ_EXTERNAL_STORAGE` (maxSdkVersion="32")
   - `MANAGE_EXTERNAL_STORAGE` dengan tools:ignore
   - `READ_PHONE_STATE`

2. **permissions.ts** - Diperbarui:
   - Support Android 13+ dengan READ_MEDIA_* permissions
   - Support Android 10-12 dengan Scoped Storage
   - Support Android 9 ke bawah dengan WRITE_EXTERNAL_STORAGE
   - Fungsi `openManageStorageSettings()` untuk membuka pengaturan khusus

### Cara Permission Muncul di Pengaturan:

Setelah install APK baru, permission storage akan muncul di:
**Settings → Apps → Santa Clara App → Permissions**

Tergantung versi Android:
- **Android 13+**: "Files and media" atau "Photos and videos"
- **Android 10-12**: "Storage" atau "Files and media"
- **Android 9 ke bawah**: "Storage"

### Testing Permission:

1. Install APK baru
2. Buka aplikasi
3. Coba download formulir PDF
4. Jika permission dialog muncul, klik "Izinkan"
5. Jika ditolak, buka Settings → Apps → Santa Clara App → Permissions
6. Aktifkan "Files and media" atau "Storage"

## Next Steps:
- [ ] Konversi logo menjadi icon launcher (5 ukuran)
- [ ] Copy icon ke folder mipmap
- [ ] Rebuild APK
- [ ] Test permission storage di pengaturan
