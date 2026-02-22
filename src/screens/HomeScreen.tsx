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
  Dimensions,
  BackHandler
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { getAnnouncements, getMasses, getUpcomingMasses } from '../utils/api';
import { getUserReservations } from '../utils/reservations';
import { logout } from '../utils/auth';
import { Announcement, Mass, Reservation } from '../types';
import { colors } from '../styles/theme';
import { supabase } from '../supabaseClient';

interface HomeScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [angelusMinutes, setAngelusMinutes] = useState<number | null>(null);
  const [upcomingMass, setUpcomingMass] = useState<Mass | null>(null);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [massCountdown, setMassCountdown] = useState<{ text: string; isUrgent: boolean } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadRecentAnnouncements();
    loadUserProfile();
    loadUserReservations();
    checkAngelusTime();
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

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateMassCountdown();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [userReservations]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Konfirmasi Logout',
        'Apakah Anda yakin ingin logout?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
                // Navigate to Auth (Login) screen - the logout function already clears the password reset flag
                navigation.navigate('Auth');
              } catch (error: any) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
              }
            }
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

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

  const loadUserProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.user.id)
          .single();
        if (data && !error) {
          setUserName(data.full_name);
        }
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserReservations = async () => {
    try {
      const reservations = await getUserReservations();
      // Filter only confirmed reservations
      const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
      setUserReservations(confirmedReservations);

      // Update countdown for the nearest upcoming mass
      updateMassCountdown(confirmedReservations);
    } catch (error: any) {
      console.error('Error loading user reservations:', error);
    }
  };

  const updateMassCountdown = (reservations?: Reservation[]) => {
    const reservationsToUse = reservations || userReservations;
    if (reservationsToUse.length === 0) {
      setMassCountdown(null);
      return;
    }

    const now = new Date();
    let nearestMass: { dateTime: Date; reservation: Reservation } | null = null;

    for (const res of reservationsToUse) {
      if (res.mass?.date_time) {
        const massDateTime = new Date(res.mass.date_time);
        if (massDateTime > now) {
          if (!nearestMass || massDateTime < nearestMass.dateTime) {
            nearestMass = { dateTime: massDateTime, reservation: res };
          }
        }
      }
    }

    if (!nearestMass) {
      setMassCountdown(null);
      return;
    }

    const diffMs = nearestMass.dateTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let countdownText: string;
    let isUrgent = false;

    if (diffMins < 60) {
      countdownText = `Misa dimulai dalam ${diffMins} menit`;
      isUrgent = true;
    } else if (diffHours < 24) {
      countdownText = `Misa dimulai dalam ${diffHours} jam`;
      isUrgent = diffHours < 3;
    } else {
      countdownText = `Misa dimulai dalam ${diffDays} hari`;
    }

    setMassCountdown({ text: countdownText, isUrgent });
  };

  const checkAngelusTime = () => {
    const now = new Date();
    const angelusTimes = [6, 12, 18]; // hours
    let nextAngelus = null;
    for (let hour of angelusTimes) {
      const angelusTime = new Date(now);
      angelusTime.setHours(hour, 0, 0, 0);
      if (angelusTime > now) {
        nextAngelus = angelusTime;
        break;
      }
    }
    if (!nextAngelus) {
      // Next day 6 AM
      nextAngelus = new Date(now);
      nextAngelus.setDate(nextAngelus.getDate() + 1);
      nextAngelus.setHours(6, 0, 0, 0);
    }
    const diffMs = nextAngelus.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins <= 60) {
      setAngelusMinutes(diffMins);
    } else {
      setAngelusMinutes(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'pagi';
    if (hour < 15) return 'siang';
    if (hour < 18) return 'sore';
    return 'malam';
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
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
      'Apakah Anda yakin ingin logout?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigate to Auth (Login) screen - the logout function already clears the password reset flag
              navigation.navigate('Auth');
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
              <Text style={styles.welcomeText}>
                Selamat {getGreeting()} {userName || 'Pengguna'}, sekarang jam {getCurrentTime()}
              </Text>
              <Text style={styles.appName}>Santa Clara App</Text>
              <Text style={styles.parishName}>Paroki Santa Clara Bekasi</Text>
              {angelusMinutes !== null && (
                <Text style={styles.angelusText}>Doa Angelus dalam {angelusMinutes} menit lagi</Text>
              )}
              {/* Mass Countdown Warning */}
              {massCountdown && (
                <View style={[styles.massCountdownContainer, massCountdown.isUrgent && styles.massCountdownUrgent]}>
                  <Icon name="event" size={16} color={colors.white} />
                  <Text style={styles.massCountdownText}>{massCountdown.text}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* User Reservations Section */}
        {userReservations.length > 0 && (
          <View style={styles.reservationSection}>
            <View style={styles.sectionHeader}>
              <Icon name="event_available" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Reservasi Misa Anda</Text>
            </View>
            {userReservations.slice(0, 2).map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                style={styles.reservationCard}
                onPress={() => {
                  if (reservation.mass) {
                    navigation.navigate('Booking', {
                      massId: reservation.mass.id,
                      massTitle: reservation.mass.title,
                      massDateTime: reservation.mass.date_time,
                    });
                  }
                }}
              >
                <View style={styles.reservationIcon}>
                  <Icon name="church" size={24} color={colors.primary} />
                </View>
                <View style={styles.reservationInfo}>
                  <Text style={styles.reservationTitle}>
                    {reservation.mass?.title || 'Misa'}
                  </Text>
                  <Text style={styles.reservationDate}>
                    {reservation.mass?.date_time
                      ? formatDate(reservation.mass.date_time)
                      : '-'}
                  </Text>
                  <View style={styles.reservationDetails}>
                    <Text style={styles.reservationDetail}>
                      {reservation.floor_quota?.floor_name || '-'}
                    </Text>
                    <Text style={styles.reservationDetail}>
                      {reservation.number_of_people} orang
                    </Text>
                  </View>
                </View>
                <Icon name="chevron_right" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

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
          <View style={[styles.section, {backgroundColor: 'transparent', shadowColor: 'transparent', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0, shadowRadius: 0, elevation: 0}]}>
            <View style={styles.sectionHeader}>
              <Icon name="apps" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Menu Utama</Text>
            </View>

            <View style={styles.menuGrid}>
              {[
                { title: 'Jadwal Misa', icon: 'event', screen: 'Masses', gradient: ['#4299e1', '#3182ce'] },
                { title: 'Donasi', icon: 'attach-money', screen: 'Donations', gradient: ['#48bb78', '#38a169'] },
                { title: 'Profil', icon: 'person', screen: 'Profile', gradient: ['#ed8936', '#dd6b20'] },
                { title: 'Pengumuman', icon: 'campaign', screen: 'Announcements', gradient: ['#9f7aea', '#805ad5'] },
                { title: 'Media', icon: 'play-circle-filled', screen: 'Media', gradient: ['#f56565', '#e53e3e'] },
                { title: 'Kumpulan Formulir', icon: 'description', screen: 'KumpulanFormulir', gradient: ['#ed8936', '#dd6b20'] },
                { title: 'Profile Gereja', icon: 'church', screen: 'ProfileGereja', gradient: ['#805ad5', '#6b46c1'] },
                { title: 'Ubah Password', icon: 'lock', screen: 'ChangePassword', gradient: ['#718096', '#4a5568'] },
              ].map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  style={styles.menuItem}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Animated.View
                    style={[
                      styles.menuIconWrapper,
                      {
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
                    <LinearGradient
                      colors={item.gradient}
                      style={styles.menuIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Icon name={item.icon} size={32} color={colors.white} />
                    </LinearGradient>
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
  angelusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: 'bold',
  },
  massCountdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  massCountdownUrgent: {
    backgroundColor: '#e53e3e',
  },
  massCountdownText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  reservationSection: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  reservationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 54, 93, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  reservationDate: {
    fontSize: 13,
    color: colors.secondary,
    marginTop: 2,
  },
  reservationDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reservationDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
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
    paddingHorizontal: 15,
  },
  menuItem: {
    width: (width - 80) / 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIconWrapper: {
  },
  menuIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuItemText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
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
