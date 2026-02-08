import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ListItem } from '../components/ListItem';
import { Loading } from '../components/Loading';
import { getMasses } from '../utils/api';
import { Mass } from '../types';

export const MassesScreen: React.FC = () => {
  const [masses, setMasses] = useState<Mass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMasses();
  }, []);

  const loadMasses = async () => {
    try {
      const data = await getMasses();
      console.log('Fetched masses data:', data);
      setMasses(data);
    } catch (error: any) {
      console.error('Error loading masses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
        <Text style={styles.title}>Jadwal Misa</Text>
      </View>

      <FlatList
        data={masses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            subtitle={`${formatDate(item.date_time)}${item.pastor ? `\nPastor: ${item.pastor}` : ''}${item.description ? `\n${item.description}` : ''}`}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada jadwal misa</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
