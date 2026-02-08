import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, BackHandler, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { getAnnouncements } from '../utils/api';
import { logout } from '../utils/auth';
import { Announcement } from '../types';
import { colors } from '../styles/theme';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentAnnouncements();

    // Add back button handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit the app?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, []);

  const loadRecentAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      // Get only the 3 most recent announcements
      setRecentAnnouncements(data.slice(0, 3));
    } catch (error: any) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by RootNavigator auth state change
    } catch (error: any) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome to Santa Clara App</Text>
        <Text style={styles.subtitle}>Paroki Santa Clara Bekasi</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
        {recentAnnouncements.length > 0 ? (
          recentAnnouncements.map((announcement) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementDate}>{formatDate(announcement.created_at)}</Text>
              <Text style={styles.announcementContent}>{announcement.content}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>Tidak ada pengumuman terbaru</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.buttonGrid}>
          <Button
            title="Jadwal Misa"
            onPress={() => navigation.navigate('Masses')}
            variant="primary"
          />
          <Button
            title="Donasi"
            onPress={() => navigation.navigate('Donations')}
            variant="primary"
          />
          <Button
            title="Profil"
            onPress={() => navigation.navigate('Profile')}
            variant="primary"
          />
          <Button
            title="Pengumuman"
            onPress={() => navigation.navigate('Announcements')}
            variant="primary"
          />
          <Button
            title="Media"
            onPress={() => navigation.navigate('Media')}
            variant="primary"
          />
        </View>
      </View>

      <View style={styles.logoutSection}>
        <Button title="Logout" onPress={handleLogout} variant="secondary" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: colors.textSecondary,
  },
  section: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  announcementCard: {
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.text,
  },
  announcementDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  noData: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  logoutSection: {
    padding: 20,
    backgroundColor: colors.white,
  },
});
