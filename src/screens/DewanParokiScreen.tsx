import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/theme';

export const DewanParokiScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dewan Paroki Harian</Text>

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
