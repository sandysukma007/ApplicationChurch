import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Linking, Alert } from 'react-native';
import { ListItem } from '../components/ListItem';
import { Loading } from '../components/Loading';
import { getMedia } from '../utils/api';
import { Media } from '../types';

export const MediaScreen: React.FC = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const alertRef = useRef<CustomAlertRef>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const data = await getMedia();
      setMedia(data);
    } catch (error: any) {
      console.error('Error loading media:', error);
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
    });
  };

  const handleMediaPress = (item: Media) => {
    if (item.type === 'video' || item.type === 'dokumen') {
      Linking.openURL(item.url).catch(() => {
        alertRef.current?.show({ title: 'Error', message: 'Unable to open media', type: 'error' });
      });
    }
  };

  const renderMediaItem = ({ item }: { item: Media }) => {
    if (item.type === 'foto') {
      return (
        <View style={styles.mediaItem}>
          <Image source={{ uri: item.url }} style={styles.image} />
          <Text style={styles.mediaName}>{item.name}</Text>
          <Text style={styles.mediaDate}>{formatDate(item.created_at)}</Text>
        </View>
      );
    } else {
      return (
        <ListItem
          title={item.name}
          subtitle={`Type: ${item.type}\n${formatDate(item.created_at)}`}
          onPress={() => handleMediaPress(item)}
        />
      );
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
        <Text style={styles.title}>Media</Text>
      </View>

      <FlatList
        data={media}
        keyExtractor={(item) => item.id}
        renderItem={renderMediaItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada media</Text>
          </View>
        }
      />
      <CustomAlert ref={alertRef} />
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
  mediaItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  mediaName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  mediaDate: {
    fontSize: 14,
    color: '#666',
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
