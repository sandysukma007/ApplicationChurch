import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/theme';

export const ArahDasarScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Arah Dasar Keuskupan Agung Jakarta</Text>
        <Text style={styles.subtitle}>Periode 2022-2026</Text>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Konten akan segera ditambahkan</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 20,
  },
  placeholder: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
