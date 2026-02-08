import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { verifyCode } from '../utils/auth';

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
    if (!code) newErrors.code = 'Verification code is required';
    if (code.length !== 8) newErrors.code = 'Code must be 8 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Check if this is for password reset or registration
      const isPasswordReset = route.params?.isPasswordReset;
      const type = isPasswordReset ? 'recovery' : 'signup';
      await verifyCode(email, code, type);
      if (isPasswordReset) {
        // Set flag for password reset flow
        await AsyncStorage.setItem('needsPasswordReset', 'true');
        alertRef.current?.show({ title: 'Success', message: 'Code verified! Please reset your password.', type: 'success' });
        // Navigation will be handled by RootNavigator
      } else {
        alertRef.current?.show({ title: 'Success', message: 'Email verified! You can now log in.', type: 'success' });
        navigation.navigate('Login');
      }
    } catch (error: any) {
      alertRef.current?.show({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>Enter the 8-digit code sent to your email.</Text>
      <Input
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={8}
        error={errors.code}
      />
      <Button title="Verify Code" onPress={handleVerifyCode} loading={loading} />
      <Button
        title="Back to Forgot Password"
        onPress={() => navigation.goBack()}
        variant="secondary"
      />
      <CustomAlert ref={alertRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});
