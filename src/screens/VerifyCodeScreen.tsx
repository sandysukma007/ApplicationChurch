import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { verifyCode } from '../utils/auth';
import { theme } from '../styles/theme';

interface VerifyCodeScreenProps {
  navigation: any;
  route: any;
}

export const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ code?: string }>({});
  const alertRef = useRef<CustomAlertRef>(null);

  const validate = () => {
    const newErrors: { code?: string } = {};
    if (!code) newErrors.code = 'Kode verifikasi wajib diisi';
    if (code.length !== 8) newErrors.code = 'Kode harus 8 digit';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Check if this is for password reset or registration
      const isPasswordReset = route.params?.isPasswordReset;

      // IMPORTANT: Set flag BEFORE verifying code for password reset
      // This ensures RootNavigator sees the flag when auth state changes to logged in
      if (isPasswordReset) {
        await AsyncStorage.setItem('needsPasswordReset', 'true');
      }

      const type = isPasswordReset ? 'recovery' : 'signup';
      await verifyCode(email, code, type);

      if (isPasswordReset) {
        alertRef.current?.show({ title: 'Berhasil', message: 'Kode verifikasi benar! Silakan reset password Anda.', type: 'success' });
        // Navigation will be handled by RootNavigator - it will see user + needsReset flag
      } else {
        alertRef.current?.show({ title: 'Berhasil', message: 'Email berhasil diverifikasi! Silakan login.', type: 'success' });
        navigation.navigate('Login');
      }
    } catch (error: any) {
      // Clear the flag if verification fails
      await AsyncStorage.removeItem('needsPasswordReset');
      alertRef.current?.show({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={theme.container}>
      <View style={theme.card}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={theme.logo} />
        <Text style={theme.title}>Verifikasi Kode</Text>
        <Text style={theme.subtitle}>Masukkan kode 8 digit yang dikirim ke email Anda.</Text>
        <View style={theme.inputContainer}>
          <Input
            placeholder="Kode Verifikasi"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={8}
            error={errors.code}
          />
        </View>
        <Button title="Verifikasi Kode" onPress={handleVerifyCode} loading={loading} variant="gradient" />
        <Button
          title="Kembali ke Lupa Password"
          onPress={() => navigation.goBack()}
          variant="secondary"
        />
      </View>
      <CustomAlert ref={alertRef} />
    </View>
  );
};
