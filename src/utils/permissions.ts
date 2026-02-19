import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';


/**
 * Check if storage permission is granted
 * For Android 10+ (API 29+), uses scoped storage approach
 * For Android 9 and below, uses traditional permission
 */
export const checkStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // iOS doesn't need explicit storage permission
  }

  try {
    const apiLevel = Platform.Version as number;

    // For Android 10+ (API 29+), we don't need WRITE_EXTERNAL_STORAGE for app-specific directories
    // We use scoped storage approach - app directories don't require permission
    if (apiLevel >= 29) {
      // Android 10+ - Scoped storage, no permission needed for app directories
      // Just check if we can access basic storage
      return true;
    } else {
      // Android 9 and below - Check traditional permission
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return result;
    }
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
};


/**
 * Request storage permission with proper handling for different Android versions
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const apiLevel = Platform.Version as number;

    // For Android 10+ (API 29+), use scoped storage approach
    if (apiLevel >= 29) {
      // For Android 10+, we use app-specific directories which don't require permission
      // But we still request for better UX and future compatibility
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      const writeGranted = result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
      const readGranted = result[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;

      return writeGranted || readGranted;
    } else {
      // Android 9 and below - Traditional permission request
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Izin Akses Storage',
          message: 'Aplikasi memerlukan izin untuk menyimpan file PDF dan formulir ke penyimpanan perangkat Anda.',
          buttonNeutral: 'Tanya Nanti',
          buttonNegative: 'Tolak',
          buttonPositive: 'Izinkan',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
};

/**
 * Request permission with explanation dialog
 * This shows a custom alert explaining why permission is needed before requesting
 */
export const requestStoragePermissionWithExplanation = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const hasPermission = await checkStoragePermission();
  if (hasPermission) {
    return true;
  }

  return new Promise((resolve) => {
    Alert.alert(
      'Izin Storage Diperlukan',
      'Untuk mengunduh dan menyimpan file formulir PDF, aplikasi memerlukan izin akses storage. File akan disimpan di folder Documents perangkat Anda.',
      [
        {
          text: 'Tidak Sekarang',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Pengaturan',
          onPress: () => {
            openAppSettings();
            resolve(false);
          },
        },
        {
          text: 'Izinkan',
          onPress: async () => {
            const granted = await requestStoragePermission();
            resolve(granted);
          },
        },
      ]
    );
  });
};

/**
 * Open app settings to manually enable permissions
 */
export const openAppSettings = (): void => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

/**
 * Show permission denied alert with option to open settings
 */
export const showPermissionDeniedAlert = (): void => {
  Alert.alert(
    'Izin Ditolak',
    'Anda telah menolak izin storage. Untuk mengunduh file formulir, silakan aktifkan izin storage di Pengaturan Aplikasi.',
    [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Buka Pengaturan',
        onPress: openAppSettings,
      },
    ]
  );
};

/**
 * Check and request all required permissions on app startup
 */
export const checkAndRequestAllPermissions = async (): Promise<{
  storage: boolean;
}> => {
  const results = {
    storage: false,
  };

  if (Platform.OS === 'android') {
    // Check and request storage permission
    results.storage = await requestStoragePermissionWithExplanation();
  } else {
    results.storage = true;
  }

  return results;
};

/**
 * Get permission status message for debugging
 */
export const getPermissionStatus = async (): Promise<string> => {
  if (Platform.OS !== 'android') {
    return 'iOS - No explicit storage permission needed';
  }

  try {
    const apiLevel = Platform.Version as number;
    const hasPermission = await checkStoragePermission();

    return `Android API ${apiLevel} - Storage Permission: ${hasPermission ? 'Granted' : 'Denied'}`;
  } catch (error) {
    return `Error checking permission: ${error}`;
  }
};
