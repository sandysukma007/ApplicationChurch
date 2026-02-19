import { Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';
import {
  checkStoragePermission,
  requestStoragePermissionWithExplanation,
  showPermissionDeniedAlert,
} from './permissions';


// Check if native modules are available
const isNativeModulesAvailable = (): boolean => {
  return !!RNFS && !!FileViewer && !!Share;
};

/**
 * Download and open a PDF file from local app assets
 * @param filePath - Path to the file in the app (e.g., 'src/docs/FORM01 - SAKRAMEN BAPTIS BAYI.pdf')
 * @param fileName - Name to save the file as
 */
export const downloadAndOpenPDF = async (
  filePath: string,
  fileName: string
): Promise<void> => {
  try {
    // Check if native modules are available
    if (!isNativeModulesAvailable()) {
      Alert.alert(
        'Error',
        'Fitur download tidak tersedia. Native module belum terpasang dengan benar.'
      );
      return;
    }

    // Request storage permission for Android
    if (Platform.OS === 'android') {
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        const granted = await requestStoragePermissionWithExplanation();
        if (!granted) {
          showPermissionDeniedAlert();
          return;
        }
      }
    }


    // Destination path - use DocumentDirectoryPath for better compatibility
    // This doesn't require external storage permissions on Android
    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    // Try to copy from assets (Android) or main bundle (iOS)
    try {
      if (Platform.OS === 'android') {
        // For Android, copy from assets
        // The PDF should be in android/app/src/main/assets/docs/ folder
        const assetPath = `docs/${fileName}`;
        await RNFS.copyFileAssets(assetPath, destPath);
      } else {
        // For iOS, copy from main bundle
        // The PDF should be included in the app bundle
        const bundlePath = `${RNFS.MainBundlePath}/${filePath}`;
        await RNFS.copyFile(bundlePath, destPath);
      }
    } catch (copyError) {
      console.error('Error copying file:', copyError);
      Alert.alert(
        'Error',
        'File tidak ditemukan. Pastikan file PDF telah ditambahkan ke aplikasi.'
      );
      return;
    }

    // Verify file was copied
    const destExists = await RNFS.exists(destPath);
    if (!destExists) {
      throw new Error('Failed to copy file to destination');
    }

    // Show success message with options
    Alert.alert(
      'Download Berhasil!',
      `File "${fileName}" telah disimpan.`,
      [
        {
          text: 'Buka File',
          onPress: () => openPDF(destPath),
        },
        {
          text: 'Bagikan',
          onPress: () => sharePDF(destPath, fileName),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );

  } catch (error) {
    console.error('Error downloading file:', error);
    Alert.alert(
      'Error',
      'Gagal mengunduh file. Silakan coba lagi.'
    );
  }
};





/**
 * Open PDF file with default PDF viewer
 */
const openPDF = async (filePath: string): Promise<void> => {
  try {
    if (!FileViewer) {
      Alert.alert('Error', 'PDF viewer tidak tersedia.');
      return;
    }
    await FileViewer.open(filePath, {
      showOpenWithDialog: true,
      displayName: 'Formulir',
    });
  } catch (error) {
    console.error('Error opening PDF:', error);
    Alert.alert('Error', 'Tidak dapat membuka file PDF.');
  }
};


/**
 * Share PDF file
 */
const sharePDF = async (filePath: string, fileName: string): Promise<void> => {
  try {
    if (!Share) {
      Alert.alert('Error', 'Fitur share tidak tersedia.');
      return;
    }
    await Share.open({
      url: `file://${filePath}`,
      title: 'Bagikan Formulir',
      message: `Berikut adalah file formulir: ${fileName}`,
      type: 'application/pdf',
    });
  } catch (error) {
    // User cancelled share
    console.log('Share cancelled or error:', error);
  }
};


/**
 * Check if file exists in app assets
 */
export const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    if (!RNFS) {
      return false;
    }
    const exists = await RNFS.exists(filePath);
    return exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};


/**
 * Get file size in human readable format
 */
export const getFileSize = async (filePath: string): Promise<string> => {
  try {
    if (!RNFS) {
      return 'Unknown';
    }
    const stats = await RNFS.stat(filePath);
    const bytes = stats.size;

    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch (error) {
    console.error('Error getting file size:', error);
    return 'Unknown';
  }
};
