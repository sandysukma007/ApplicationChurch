# PDF Download Fix - Implementation Plan

## Steps to Complete

### 1. ✅ AndroidManifest.xml
- [x] Already has proper permissions and `requestLegacyExternalStorage="true"`

### 2. Fix fileDownload.ts
- [x] Add null checks for native modules
- [x] Fix asset path handling
- [x] Add better error handling
- [x] Use DocumentDirectoryPath as fallback


### 3. Update KumpulanFormulirScreen.tsx
- [x] Switch from static PDF download to HTML-to-PDF generation
- [x] Create HTML template for Baptis Bayi form
- [x] Add PDF generation function

### 4. Add Type Safety
- [x] Add type declarations for react-native-html-to-pdf in types/index.ts

## Progress Tracking
- [x] Step 2: Fix fileDownload.ts
- [x] Step 3: Update KumpulanFormulirScreen.tsx
- [x] Step 4: Add Type Safety
- [x] Testing on Android - Build successful, app installed
