import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from './Button';
import { colors, theme } from '../styles/theme';

interface AlertData {
  title: string;
  message: string;
  type: 'success' | 'error';
}

export interface CustomAlertRef {
  show: (data: AlertData) => void;
}

export const CustomAlert = forwardRef<CustomAlertRef>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<AlertData | null>(null);

  useImperativeHandle(ref, () => ({
    show: (alertData: AlertData) => {
      setData(alertData);
      setVisible(true);
    },
  }));

  const close = () => setVisible(false);

  if (!data) return null;

  const isSuccess = data.type === 'success';
  const iconName = isSuccess ? 'check-circle' : 'error';
  const iconColor = isSuccess ? '#27AE60' : colors.error;
  const gradientColors = isSuccess
    ? ['#27AE60', '#2ECC71']
    : [colors.error, '#E74C3C'];

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={close}
      style={styles.modal}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View style={styles.alertCard}>
        <View style={[styles.iconContainer, { backgroundColor: isSuccess ? '#E8F8F5' : '#FDEDEC' }]}>
          <Icon name={iconName} size={48} color={iconColor} />
        </View>

        <Text style={[styles.title, isSuccess ? styles.successTitle : styles.errorTitle]}>
          {data.title}
        </Text>

        <Text style={styles.message}>{data.message}</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: isSuccess ? '#27AE60' : colors.error }]}
          onPress={close}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
});

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    width: width * 0.8,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successTitle: {
    color: '#27AE60',
  },
  errorTitle: {
    color: colors.error,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
