import React, { useState, useRef } from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { login } from '../utils/auth';
import { LoginCredentials } from '../types';
import { theme } from '../styles/theme';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const alertRef = useRef<CustomAlertRef>(null);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const credentials: LoginCredentials = { email, password };
      await login(credentials);
      // Navigation will be handled by auth state
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
        <Text style={theme.title}>Santa Clara App</Text>
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
        <Button title="Login" onPress={handleLogin} loading={loading} variant="gradient" />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={theme.link}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={theme.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
      <CustomAlert ref={alertRef} />
    </View>
  );
};
