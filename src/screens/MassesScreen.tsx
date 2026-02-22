import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Loading } from '../components/Loading';
import { getMassesWithImam } from '../utils/masses';
import { getUserReservationForDate } from '../utils/reservations';
import { Mass } from '../types';
import { colors } from '../styles/theme';
import { MainStackParamList } from '../navigation/MainNavigator';

type MassesScreenNavigationProp = NavigationProp<MainStackParamList, 'Masses'>;

export const MassesScreen: React.FC = () => {
  const [masses, setMasses] = useState<Mass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reservationsByDate, setReservationsByDate] = useState<Record<string, boolean>>({});
  const navigation = useNavigation<MassesScreenNavigationProp>();

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadMasses();
    }, [])
  );

  const loadMasses = async () => {
    try {
      setLoading(true);
      const data = await getMassesWithImam();
      console.log('Fetched masses data:', data);
      setMasses(data);

      // Check reservations for each mass date
      const reservationStatus: Record<string, boolean> = {};
      for (const mass of data) {
        const reservation = await getUserReservationForDate(mass.date_time);
        reservationStatus[mass.date_time] = !!reservation;
      }
      setReservationsByDate(reservationStatus);
    } catch (error: any) {
      console.error('Error loading masses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMasses();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase();
  };

  const getDayNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
  };

  const handleBooking = (mass: Mass) => {
    navigation.navigate('Booking', {
      massId: mass.id,
      massTitle: mass.title,
      massDateTime: mass.date_time,
    });
  };

  if (loading) {
    return <Loading />;
  }

  const renderMassItem = ({ item }: { item: Mass }) => {
    const hasReservationOnDate = reservationsByDate[item.date_time] || false;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.dayName}>{getDayName(item.date_time)}</Text>
            <Text style={styles.dayNumber}>{getDayNumber(item.date_time)}</Text>
            <Text style={styles.monthName}>{getMonthName(item.date_time)}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.massTitle}>{item.title}</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeIcon}>🕐</Text>
              <Text style={styles.timeText}>{formatTime(item.date_time)}</Text>
            </View>
            {/* Show Imam if available, fallback to pastor */}
            {(item.imam?.full_name || item.pastor) && (
              <View style={styles.pastorContainer}>
                <Text style={styles.pastorIcon}>👨‍</Text>
                <Text style={styles.pastorText}>
                  {item.imam?.full_name
                    ? (item.imam.title ? `${item.imam.title} ${item.imam.full_name}` : item.imam.full_name)
                    : item.pastor}
                </Text>
              </View>
            )}
          </View>
        </View>
        {item.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        )}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={hasReservationOnDate ? styles.bookingButtonDisabled : styles.bookingButton}
            onPress={() => handleBooking(item)}
            disabled={hasReservationOnDate}
          >
            <Text style={hasReservationOnDate ? styles.bookingButtonTextDisabled : styles.bookingButtonText}>
              {hasReservationOnDate ? '✓ Sudah Booking di Jadwal Lain' : '📅 Reservasi Kuota'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Jadwal Misa</Text>
          <Text style={styles.headerSubtitle}>Gereja Santa Clara Bekasi</Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {/* Content */}
      <FlatList
        data={masses}
        keyExtractor={(item) => item.id}
        renderItem={renderMassItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Tidak Ada Jadwal Misa</Text>
            <Text style={styles.emptyText}>
              Saat ini tidak ada jadwal misa yang tersedia.{'\n'}
              Silakan hubungi pihak gereja untuk informasi lebih lanjut.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 12,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  headerDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  dateContainer: {
    width: 65,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 36,
  },
  monthName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  massTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  timeText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  pastorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pastorIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  pastorText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  descriptionContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  bookingButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookingButtonDisabled: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookingButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bookingButtonTextDisabled: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
