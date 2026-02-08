import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadRecentAnnouncements();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadRecentAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setRecentAnnouncements(data.slice(0, 3));
    } catch (error: any) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#1a365d', colors.primary]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.logoOverlay} />
            </View>

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Selamat Datang</Text>
              <Text style={styles.appName}>Santa Clara App</Text>
              <Text style={styles.parishName}>Paroki Santa Clara Bekasi</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          {/* Pengumuman Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="campaign" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Announcements')}
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <Icon name="chevron_right" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((announcement, index) => (
                <TouchableOpacity
                  key={announcement.id}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('AnnouncementDetail', { id: announcement.id })}
                >
                  <Animated.View
                    style={[
                      styles.announcementCard,
                      {
                        opacity: fadeAnim,
                        transform: [{
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 50],
                            outputRange: [0, 50 * index]
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={['#ffffff', '#f8f9fa']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.announcementHeader}>
                      <View style={styles.announcementDateBadge}>
                        <Icon name="event" size={14} color={colors.white} />
                        <Text style={styles.announcementDateBadgeText}>
                          {formatDate(announcement.created_at).split(',')[0]}
                        </Text>
                      </View>
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>BARU</Text>
                      </View>
                    </View>
                    <Text style={styles.announcementTitle} numberOfLines={2}>
                      {announcement.title}
                    </Text>
                    <Text style={styles.announcementContent} numberOfLines={3}>
                      {announcement.content}
                    </Text>
                    <View style={styles.readMoreContainer}>
                      <Text style={styles.readMoreText}>Baca Selengkapnya</Text>
                      <Icon name="arrow_forward" size={16} color={colors.primary} />
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="info_outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>Tidak ada pengumuman terbaru</Text>
              </View>
            )}
          </View>

          {/* Menu Utama Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="apps" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Menu Utama</Text>
            </View>

            <View style={styles.menuGrid}>
              {[
                { title: 'Jadwal Misa', icon: 'event', screen: 'Masses', color: '#4299e1' },
                { title: 'Donasi', icon: 'attach_money', screen: 'Donations', color: '#48bb78' },
                { title: 'Profil', icon: 'person', screen: 'Profile', color: '#ed8936' },
                { title: 'Pengumuman', icon: 'campaign', screen: 'Announcements', color: '#9f7aea' },
                { title: 'Media', icon: 'play_circle_filled', screen: 'Media', color: '#f56565' },
                { title: 'Ubah Password', icon: 'lock', screen: 'ChangePassword', color: '#718096' },
              ].map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Animated.View
                    style={[
                      styles.menuIconContainer,
                      {
                        backgroundColor: item.color + '15',
                        opacity: fadeAnim,
                        transform: [{
                          scale: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1]
                          })
                        }]
                      }
                    ]}
                  >
                    <Icon name={item.icon} size={28} color={item.color} />
                  </Animated.View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logout Section */}
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={['#fed7d7', '#feb2b2']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Icon name="logout" size={20} color="#c53030" />
            <Text style={styles.logoutText}>Keluar dari Aplikasi</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 Paroki Santa Clara Bekasi</Text>
            <Text style={styles.footerVersion}>Versi 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 220,
  },
  headerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoOverlay: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'System',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginVertical: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  parishName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 10,
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  announcementCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  announcementDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  announcementDateBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  newBadge: {
    backgroundColor: '#f56565',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  newBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingTop: 8,
  },
  readMoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 80) / 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItemText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutText: {
    color: '#c53030',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    color: colors.textLight,
  },
});