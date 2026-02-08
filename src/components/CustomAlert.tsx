import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
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

  return (
    <Modal isVisible={visible} onBackdropPress={close} style={styles.modal}>
      <View style={[theme.card, styles.alertCard]}>
        <Text style={[styles.title, data.type === 'success' ? styles.successTitle : styles.errorTitle]}>
          {data.title}
        </Text>
        <Text style={styles.message}>{data.message}</Text>
        <Button title="OK" onPress={close} variant="primary" />
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successTitle: {
    color: '#27AE60', // Green for success
  },
  errorTitle: {
    color: colors.error, // Red for error
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});
