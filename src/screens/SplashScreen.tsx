import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, Platform } from 'react-native';
import { checkAndRequestAllPermissions, getPermissionStatus } from '../utils/permissions';

export const SplashScreen: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('Checking...');

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Check current permission status
        const status = await getPermissionStatus();
        setPermissionStatus(status);
        console.log('Permission status:', status);

        // Request permissions on app startup (only for Android)
        if (Platform.OS === 'android') {
          // Small delay to let the splash screen show first
          setTimeout(async () => {
            const results = await checkAndRequestAllPermissions();
            console.log('Permission results:', results);

            if (!results.storage) {
              console.log('Storage permission not granted on startup');
              // Don't block the app, user will be asked again when downloading
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error requesting permissions on startup:', error);
      }
    };

    requestPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Santa Clara App</Text>
      <Text style={styles.subtitle}>Welcome to our community</Text>
      {Platform.OS === 'android' && (
        <Text style={styles.permissionStatus}>{permissionStatus}</Text>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  permissionStatus: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
