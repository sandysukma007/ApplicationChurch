import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { resetPassword } from '../utils/auth';
import { theme } from '../styles/theme';

interface ResetPasswordScreenProps {
  navigation: any;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const alertRef = useRef<CustomAlertRef>(null);

  const validate = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword) newErrors.newPassword = 'Password baru wajib diisi';
    if (newPassword.length < 6) newErrors.newPassword = 'Password minimal 6 karakter';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPassword(newPassword);
      // Clear the password reset flag
      await AsyncStorage.removeItem('needsPasswordReset');
      alertRef.current?.show({ title: 'Berhasil', message: 'Password berhasil direset! Silakan login dengan password baru.', type: 'success' });
      // Navigate to Login after a short delay
      setTimeout(() => {
        navigation.navigate('Auth');
      }, 2000);
    } catch (error: any) {
      alertRef.current?.show({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={theme.container}>
      <View style={theme.card}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={theme.logo} />
        <Text style={theme.title}>Reset Password</Text>
        <Text style={theme.subtitle}>Masukkan password baru Anda.</Text>
        <View style={theme.inputContainer}>
          <Input
            placeholder="Password Baru"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            error={errors.newPassword}
          />
        </View>
        <View style={theme.inputContainer}>
          <Input
            placeholder="Konfirmasi Password Baru"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />
        </View>
        <Button title="Reset Password" onPress={handleResetPassword} loading={loading} variant="gradient" />
        <Button
          title="Kembali ke Login"
          onPress={async () => {
            await AsyncStorage.removeItem('needsPasswordReset');
            navigation.navigate('Auth');
          }}
          variant="secondary"
        />
      </View>
      <CustomAlert ref={alertRef} />
    </View>
  );
};
