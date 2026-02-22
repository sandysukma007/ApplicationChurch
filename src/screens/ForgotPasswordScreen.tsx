import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { sendVerificationCode } from '../utils/auth';
import { theme } from '../styles/theme';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const alertRef = useRef<CustomAlertRef>(null);

  const validate = () => {
    const newErrors: { email?: string } = {};
    if (!email) newErrors.email = 'Email wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await sendVerificationCode(email);
      alertRef.current?.show({ title: 'Berhasil', message: 'Kode verifikasi telah dikirim! Silakan cek email Anda.', type: 'success' });
      setTimeout(() => {
        navigation.navigate('VerifyCode', { email, isPasswordReset: true });
      }, 1500);
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
        <Text style={theme.title}>Lupa Password</Text>
        <Text style={theme.subtitle}>Masukkan email Anda untuk menerima kode verifikasi.</Text>
        <View style={theme.inputContainer}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
          />
        </View>
        <Button title="Kirim Kode Verifikasi" onPress={handleForgotPassword} loading={loading} variant="gradient" />
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={theme.link}>Kembali ke Login</Text>
        </TouchableOpacity>
      </View>
      <CustomAlert ref={alertRef} />
    </View>
  );
};
