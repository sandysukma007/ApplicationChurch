import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from '../components/Button';

interface VerifyEmailScreenProps {
  navigation: any;
  route: any;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation, route }) => {
  const { type } = route.params || {};
  const isReset = type === 'reset';

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
      <Text style={styles.title}>{isReset ? 'Reset Your Password' : 'Verify Your Email'}</Text>
      <Text style={styles.message}>
        {isReset
          ? 'A password reset email has been sent to your email address. Please check your email and click the reset link to reset your password.'
          : 'A verification email has been sent to your email address. Please check your email and click the verification link to activate your account.'
        }
      </Text>
      <Button
        title="Back to Login"
        onPress={() => navigation.navigate('Login')}
        variant="secondary"
      />
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
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
});
