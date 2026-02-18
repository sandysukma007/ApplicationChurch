import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loading } from '../components/Loading';
import { getSeatAvailability, createReservation, getUserReservationForMass } from '../utils/api';
import { SeatAvailability, Reservation } from '../types';
import { colors } from '../styles/theme';
import { MainStackParamList } from '../navigation/MainNavigator';

type BookingScreenRouteProp = RouteProp<MainStackParamList, 'Booking'>;
type BookingScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Booking'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

// Seat layout: 3 columns (A, B, C) × 2 rows (1, 2) × 10 seats = 60 seats
const COLUMNS = ['A', 'B', 'C'];
const ROWS = [1, 2];
const SEATS_PER_ROW = 10;

export const BookingScreen: React.FC = () => {
  const route = useRoute<BookingScreenRouteProp>();
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const { massId, massTitle, massDateTime } = route.params;

  const [seats, setSeats] = useState<SeatAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<SeatAvailability | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [userReservation, setUserReservation] = useState<Reservation | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    loadSeatAvailability();
  }, [massId]);

  const loadSeatAvailability = async () => {
    try {
      setLoading(true);
      const [seatData, reservationData] = await Promise.all([
        getSeatAvailability(massId),
        getUserReservationForMass(massId),
      ]);
      setSeats(seatData);
      setUserReservation(reservationData);
    } catch (error: any) {
      console.error('Error loading seat availability:', error);
      Alert.alert('Error', 'Gagal memuat ketersediaan bangku');
    } finally {
      setLoading(false);
    }
  };

  const getSeatStatus = (seat: SeatAvailability): 'available' | 'limited' | 'full' | 'selected' | 'booked' => {
    if (selectedSeat?.seat_id === seat.seat_id) return 'selected';
    if (seat.available_count === 0) return 'full';
    if (seat.available_count <= 3) return 'limited';
    return 'available';
  };

  const getSeatColor = (status: 'available' | 'limited' | 'full' | 'selected' | 'booked'): string => {
    switch (status) {
      case 'selected':
        return colors.primary;
      case 'full':
        return '#E74C3C';
      case 'limited':
        return '#F39C12';
      case 'booked':
        return '#95A5A6';
      default:
        return '#27AE60';
    }
  };

  const handleSeatSelect = (seat: SeatAvailability) => {
    if (seat.available_count === 0) {
      Alert.alert('Info', 'Bangku ini sudah penuh');
      return;
    }
    if (userReservation && userReservation.seat_id !== seat.seat_id) {
      Alert.alert('Info', 'Anda sudah memiliki reservasi untuk Misa ini');
      return;
    }
    setSelectedSeat(seat);
    setNumberOfPeople(1);
  };

  const handleBooking = async () => {
    if (!selectedSeat) {
      Alert.alert('Pilih Bangku', 'Silakan pilih bangku terlebih dahulu');
      return;
    }

    try {
      setIsBooking(true);
      await createReservation({
        mass_id: massId,
        seat_id: selectedSeat.seat_id,
        number_of_people: numberOfPeople,
      });

      Alert.alert(
        'Berhasil!',
        `Reservasi berhasil!\n\nBangku: ${selectedSeat.column_name}-${selectedSeat.row_number}-${selectedSeat.seat_number}\nJumlah: ${numberOfPeople} orang`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      Alert.alert('Error', error.message || 'Gagal membuat reservasi');
    } finally {
      setIsBooking(false);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading />;
  }

  const renderSeat = (column: string, row: number, seatNum: number) => {
    const seat = seats.find(
      s => s.column_name === column && s.row_number === row && s.seat_number === seatNum
    );

    if (!seat) {
      return (
        <View key={`${column}-${row}-${seatNum}`} style={styles.seatPlaceholder} />
      );
    }

    const status = getSeatStatus(seat);
    const seatColor = getSeatColor(status);

    return (
      <TouchableOpacity
        key={`${column}-${row}-${seatNum}`}
        style={[styles.seat, { backgroundColor: seatColor }]}
        onPress={() => handleSeatSelect(seat)}
        disabled={seat.available_count === 0 || !!userReservation}
      >
        <Text style={styles.seatText}>{seatNum}</Text>
      </TouchableOpacity>
    );
  };

  const renderRow = (column: string, row: number) => {
    return (
      <View key={`${column}-${row}`} style={styles.row}>
        <Text style={styles.rowLabel}>Baris {row}</Text>
        <View style={styles.seatsContainer}>
          {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map(seatNum =>
            renderSeat(column, row, seatNum)
          )}
        </View>
      </View>
    );
  };

  const renderColumn = (column: string) => {
    return (
      <View key={column} style={styles.column}>
        <Text style={styles.columnHeader}>
          {column === 'A' ? 'KIRI' : column === 'B' ? 'TENGAH' : 'KANAN'}
        </Text>
        {ROWS.map(row => renderRow(column, row))}
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
          <Text style={styles.headerTitle}>Pilih Bangku</Text>
          <Text style={styles.headerSubtitle}>{massTitle}</Text>
          <Text style={styles.headerDate}>
            {formatDate(massDateTime)} - {formatTime(massDateTime)}
          </Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {/* User Reservation Info */}
      {userReservation && (
        <View style={styles.reservationInfo}>
          <Text style={styles.reservationTitle}>Reservasi Anda</Text>
          <Text style={styles.reservationDetail}>
            Bangku: {userReservation.seat?.column_name}-{userReservation.seat?.row_number}-{userReservation.seat?.seat_number}
          </Text>
          <Text style={styles.reservationDetail}>
            Jumlah: {userReservation.number_of_people} orang
          </Text>
        </View>
      )}

      {/* Seat Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#27AE60' }]} />
          <Text style={styles.legendText}>Tersedia</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F39C12' }]} />
          <Text style={styles.legendText}>Terbatas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E74C3C' }]} />
          <Text style={styles.legendText}>Penuh</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Dipilih</Text>
        </View>
      </View>

      {/* Stage/Altar */}
      <View style={styles.stage}>
        <Text style={styles.stageText}>ALTAR</Text>
      </View>

      {/* Seat Layout */}
      <ScrollView style={styles.seatLayout} showsVerticalScrollIndicator={false}>
        {COLUMNS.map(column => renderColumn(column))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Booking Form */}
      {selectedSeat && !userReservation && (
        <View style={styles.bookingForm}>
          <View style={styles.selectedSeatInfo}>
            <Text style={styles.selectedSeatLabel}>Bangku Dipilih:</Text>
            <Text style={styles.selectedSeatValue}>
              {selectedSeat.column_name}-{selectedSeat.row_number}-{selectedSeat.seat_number}
            </Text>
            <Text style={styles.availableText}>
              Tersedia: {selectedSeat.available_count} orang
            </Text>
          </View>

          <View style={styles.numberInput}>
            <Text style={styles.numberLabel}>Jumlah Orang:</Text>
            <View style={styles.numberControls}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
              >
                <Text style={styles.numberButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.numberValue}>{numberOfPeople}</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setNumberOfPeople(Math.min(selectedSeat.available_count, numberOfPeople + 1))}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={isBooking}
          >
            <Text style={styles.bookButtonText}>
              {isBooking ? 'Memproses...' : 'Reservasi Sekarang'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
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
    paddingBottom: 20,
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
    width: 50,
    height: 50,
    marginBottom: 8,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  headerDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  headerDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 15,
    backgroundColor: colors.background,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  reservationInfo: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  reservationDetail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
  },
  stage: {
    backgroundColor: colors.secondary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  stageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 4,
  },
  seatLayout: {
    flex: 1,
    paddingHorizontal: 16,
  },
  column: {
    marginBottom: 16,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  seatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  seat: {
    width: (SCREEN_WIDTH - 80) / 10,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  seatPlaceholder: {
    width: (SCREEN_WIDTH - 80) / 10,
    height: 32,
    margin: 2,
  },
  seatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  bottomSpacing: {
    height: 20,
  },
  bookingForm: {
    backgroundColor: colors.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedSeatInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedSeatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedSeatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  availableText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  numberInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  numberLabel: {
    fontSize: 14,
    color: colors.text,
  },
  numberControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  numberValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  backButton: {
    backgroundColor: colors.secondary,
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
