import React, { useState, useRef } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { register } from '../utils/auth';
import { RegisterData } from '../types';
import { colors, theme } from '../styles/theme';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
  }>({});
  const alertRef = useRef<CustomAlertRef>(null);

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      fullName?: string;
    } = {};
    if (!email) newErrors.email = 'Email wajib diisi';
    if (!password) newErrors.password = 'Password wajib diisi';
    if (password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';
    if (!fullName) newErrors.fullName = 'Nama lengkap wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data: RegisterData = { email, password, full_name: fullName, role: 'jemaat' };
      await register(data);
      alertRef.current?.show({ title: 'Berhasil', message: 'Pendaftaran berhasil! Silakan login.', type: 'success' });
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error: any) {
      alertRef.current?.show({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={theme.container}>
      <ScrollView>
        <View style={theme.card}>
          <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={theme.logo} />
          <Text style={theme.title}>Daftar Akun</Text>
          <View style={theme.inputContainer}>
            <Input
              placeholder="Nama Lengkap"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />
          </View>
          <View style={theme.inputContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />
          </View>
          <View style={theme.inputContainer}>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
          </View>
          <View style={theme.inputContainer}>
            <Input
              placeholder="Konfirmasi Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          <Button title="Daftar" onPress={handleRegister} loading={loading} variant="gradient" />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={theme.link}>Sudah punya akun? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert ref={alertRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
});
