import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { colors } from '../styles/theme';
import { Imam } from '../types';
import { getActiveImams } from '../utils/imams';
import { Loading } from '../components/Loading';

export const ProfilImamScreen: React.FC = () => {
  const [imams, setImams] = useState<Imam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImams();
  }, []);

  const loadImams = async () => {
    try {
      setLoading(true);
      const data = await getActiveImams();
      setImams(data);
    } catch (error: any) {
      console.error('Error loading imams:', error);
      Alert.alert('Error', 'Gagal memuat data imam');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const renderImamCard = (imam: Imam) => (
    <View key={imam.id} style={styles.imamCard}>
      {imam.photo_url ? (
        <Image source={{ uri: imam.photo_url }} style={styles.imamImage} />
      ) : (
        <View style={[styles.imamImage, styles.imamImagePlaceholder]}>
          <Text style={styles.imamImagePlaceholderText}>
            {imam.full_name.charAt(0)}
          </Text>
        </View>
      )}
      <View style={styles.imamInfo}>
        <Text style={styles.imamTitle}>{imam.title || 'Pastor'}</Text>
        <Text style={styles.imamName}>{imam.full_name}</Text>
        {imam.religious_order && (
          <Text style={styles.imamOrder}>{imam.religious_order}</Text>
        )}
        {imam.position && (
          <Text style={styles.imamPosition}>{imam.position}</Text>
        )}
        {imam.address && (
          <Text style={styles.imamAddress}>{imam.address}</Text>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profil Imam</Text>

        {imams.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Belum ada data imam</Text>
          </View>
        ) : (
          <View style={styles.imamList}>
            {imams.map(renderImamCard)}
          </View>
        )}
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
  imamList: {
    gap: 16,
  },
  imamCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imamImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  imamImagePlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imamImagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  imamInfo: {
    flex: 1,
  },
  imamTitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  imamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  imamOrder: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  imamPosition: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  imamAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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
