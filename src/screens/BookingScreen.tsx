import React, { useEffect, useState } from 'react';
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
import { getSeatAvailability, createReservation, getUserReservationForMass, getReservationsByMass } from '../utils/api';
import { SeatAvailability, Reservation } from '../types';
import { colors } from '../styles/theme';
import { MainStackParamList } from '../navigation/MainNavigator';

type BookingScreenRouteProp = RouteProp<MainStackParamList, 'Booking'>;
type BookingScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Booking'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

// Horizontal layout:
// - Columns A, B, C as vertical sections (left to right, altar on far right)
// - For each column: rows 1-10, each with 10 seats
// - So layout is: [A1-10][A2-10]...[A10-10][B1-10][B2-10]...[B10-10][C1-10][C2-10]...[C10-10] -> ALTAR
const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SEAT_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COLUMNS = ['A', 'B', 'C'];

export const BookingScreen: React.FC = () => {
  const route = useRoute<BookingScreenRouteProp>();
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const { massId, massTitle, massDateTime } = route.params;

  const [seats, setSeats] = useState<SeatAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<SeatAvailability[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [userReservation, setUserReservation] = useState<Reservation | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSeatIds, setBookedSeatIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSeatAvailability();
  }, [massId]);

  const loadSeatAvailability = async () => {
    try {
      setLoading(true);
      const [seatData, reservationData, allReservations] = await Promise.all([
        getSeatAvailability(massId),
        getUserReservationForMass(massId),
        getReservationsByMass(massId),
      ]);
      setSeats(seatData);
      setUserReservation(reservationData);

      // Set booked seat IDs (seats already reserved by other users)
      const bookedIds = new Set<string>();
      allReservations.forEach(res => {
        if (res.seat_id) {
          bookedIds.add(res.seat_id);
        }
      });
      setBookedSeatIds(bookedIds);
    } catch (error: any) {
      console.error('Error loading seat availability:', error);
      Alert.alert('Error', 'Gagal memuat ketersediaan bangku');
    } finally {
      setLoading(false);
    }
  };

  const isSeatSelected = (seat: SeatAvailability): boolean => {
    return selectedSeats.some(s => s.seat_id === seat.seat_id);
  };

  const getSeatStatus = (seat: SeatAvailability): 'available' | 'limited' | 'full' | 'selected' | 'booked' => {
    if (isSeatSelected(seat)) return 'selected';
    if (bookedSeatIds.has(seat.seat_id)) return 'booked';
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

  // Find adjacent seats in the SAME row - like cinema seats: A1, A2, A3, etc.
  const findAdjacentSeats = (seat: SeatAvailability, count: number): SeatAvailability[] => {
    const adjacent: SeatAvailability[] = [seat];

    // Get current position
    const currentColumn = seat.column_name;
    const currentRow = seat.row_number;
    const currentSeatNum = seat.seat_number;

    // Find next available seats in the SAME column and SAME row
    // Seat numbers go: 1, 2, 3, ... 10
    let seatNum = currentSeatNum;

    for (let i = 1; i < count; i++) {
      seatNum++; // Move to next seat number

      // If we've gone past seat 10, stop
      if (seatNum > 10) {
        break;
      }

      // Find the seat at this position in the SAME column and row
      const nextSeat = seats.find(s =>
        s.column_name === currentColumn &&
        s.row_number === currentRow &&
        s.seat_number === seatNum &&
        s.available_count > 0 &&
        !bookedSeatIds.has(s.seat_id) &&
        !adjacent.some(adj => adj.seat_id === s.seat_id)
      );

      if (nextSeat) {
        adjacent.push(nextSeat);
      } else {
        // No more available seats in this row/column, stop
        break;
      }
    }

    return adjacent;
  };

  const handleSeatSelect = (seat: SeatAvailability) => {
    // Check if already booked by someone else
    if (bookedSeatIds.has(seat.seat_id)) {
      Alert.alert('Info', 'Bangku ini sudah dipesan oleh jemaat lain');
      return;
    }

    if (seat.available_count === 0) {
      Alert.alert('Info', 'Bangku ini sudah penuh');
      return;
    }

    if (userReservation && userReservation.seat_id !== seat.seat_id) {
      Alert.alert('Info', 'Anda sudah memiliki reservasi untuk Misa ini');
      return;
    }

    // Toggle seat selection
    if (isSeatSelected(seat)) {
      // Deselect the seat
      setSelectedSeats(prev => prev.filter(s => s.seat_id !== seat.seat_id));
      return;
    }

    // If selecting a new seat, handle multiple selection based on numberOfPeople
    if (numberOfPeople > 1) {
      const adjacentSeats = findAdjacentSeats(seat, numberOfPeople);
      if (adjacentSeats.length < numberOfPeople) {
        Alert.alert('Info', `Hanya ada ${adjacentSeats.length} bangku kosong di samping. Silakan pilih bangku lain.`);
        return;
      }
      setSelectedSeats(adjacentSeats);
    } else {
      setSelectedSeats([seat]);
    }
  };

  // Update selected seats when numberOfPeople changes
  const handleNumberOfPeopleChange = (newCount: number) => {
    setNumberOfPeople(newCount);

    if (selectedSeats.length > 0 && newCount > 1) {
      // Try to expand selection to adjacent seats
      const firstSelected = selectedSeats[0];
      const adjacentSeats = findAdjacentSeats(firstSelected, newCount);

      if (adjacentSeats.length >= newCount) {
        setSelectedSeats(adjacentSeats);
      } else if (adjacentSeats.length < newCount) {
        // Not enough adjacent seats, keep current selection but warn user
        Alert.alert('Info', `Hanya ada ${adjacentSeats.length} bangku kosong di samping bangku yang dipilih.`);
      }
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Pilih Bangku', 'Silakan pilih bangku terlebih dahulu');
      return;
    }

    if (selectedSeats.length !== numberOfPeople) {
      Alert.alert('Pilih Bangku', `Silakan pilih ${numberOfPeople} bangku`);
      return;
    }

    try {
      setIsBooking(true);

      // Create a reservation for each selected seat
      // Each seat gets number_of_people = 1 (each seat is for 1 person)
      for (let i = 0; i < selectedSeats.length; i++) {
        const seat = selectedSeats[i];

        await createReservation({
          mass_id: massId,
          seat_id: seat.seat_id,
          number_of_people: 1, // Each seat is for 1 person
        });
      }

      const seatNumbers = selectedSeats
        .map(s => `${s.column_name}${s.row_number}${s.seat_number}`)
        .join(', ');

      // Show success alert with close button
      Alert.alert(
        'Berhasil!',
        `Reservasi berhasil!\n\nBangku: ${seatNumbers}\nJumlah: ${selectedSeats.length} orang\n\nSilakan datang tepat waktu untuk memudahkan verifikasi.`,
        [{
          text: 'Tutup',
          onPress: () => {
            // Refresh the page to show updated seat status
            loadSeatAvailability();
            setSelectedSeats([]);
            setNumberOfPeople(1);
          }
        }]
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

  const renderSeat = (column: string, rowNum: number, seatNum: number) => {
    const seat = seats.find(
      s => s.column_name === column && s.row_number === rowNum && s.seat_number === seatNum
    );

    if (!seat) {
      return (
        <View key={`${column}-${rowNum}-${seatNum}`} style={styles.seatPlaceholder} />
      );
    }

    const status = getSeatStatus(seat);
    const seatColor = getSeatColor(status);

    return (
      <TouchableOpacity
        key={`${column}-${rowNum}-${seatNum}`}
        style={[styles.seat, { backgroundColor: seatColor }]}
        onPress={() => handleSeatSelect(seat)}
        disabled={(seat.available_count === 0 && !isSeatSelected(seat)) || !!userReservation}
      >
        <Text style={styles.seatText}>{seatNum}</Text>
      </TouchableOpacity>
    );
  };

  // Render column - like movie theater: each column shows 10 rows, each row with 10 seats
  const renderColumn = (column: string) => {
    return (
      <View key={`column-${column}`} style={styles.columnContainer}>
        <Text style={styles.columnHeader}>{column}</Text>
        <View style={styles.columnSeats}>
          {ROWS.map(rowNum => (
            <View key={`${column}-row-${rowNum}`} style={styles.seatRow}>
              {SEAT_NUMBERS.map(seatNum => renderSeat(column, rowNum, seatNum))}
            </View>
          ))}
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
          <Text style={styles.headerTitle}>Pilih Bangku</Text>
          <Text style={styles.headerSubtitle}>{massTitle}</Text>
          <Text style={styles.headerDate}>
            {formatDate(massDateTime)} - {formatTime(massDateTime)}
          </Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {/* Altar - at the TOP */}
      <View style={styles.altarTopContainer}>
        <View style={styles.altar}>
          <Text style={styles.altarText}>ALTAR</Text>
        </View>
        <Text style={styles.altarDirection}>↓ Menghadap</Text>
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
          <View style={[styles.legendColor, { backgroundColor: '#95A5A6' }]} />
          <Text style={styles.legendText}>Terpakai</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Dipilih</Text>
        </View>
      </View>

      {/* Horizontal Seat Layout - Movie Theater Style */}
      <View style={styles.mainContent}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.seatLayoutHorizontal}
          contentContainerStyle={styles.seatLayoutContent}
        >
          {/* Render 3 columns: A, B, C - like movie theater */}
          {COLUMNS.map(column => renderColumn(column))}
        </ScrollView>
      </View>

      {/* Booking Form */}
      {selectedSeats.length > 0 && !userReservation && (
        <View style={styles.bookingForm}>
          <View style={styles.selectedSeatInfo}>
            <Text style={styles.selectedSeatLabel}>Bangku Dipilih:</Text>
            <Text style={styles.selectedSeatValue}>
              {selectedSeats.map(s => `${s.column_name}${s.row_number}-${s.seat_number}`).join(', ')}
            </Text>
            <Text style={styles.availableText}>
              {selectedSeats.length} bangku dipilih
            </Text>
          </View>

          <View style={styles.numberInput}>
            <Text style={styles.numberLabel}>Jumlah Orang:</Text>
            <View style={styles.numberControls}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => handleNumberOfPeopleChange(Math.max(1, numberOfPeople - 1))}
              >
                <Text style={styles.numberButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.numberValue}>{numberOfPeople}</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => handleNumberOfPeopleChange(Math.min(10, numberOfPeople + 1))}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.bookButton,
              isBooking && styles.bookButtonDisabled,
              selectedSeats.length !== numberOfPeople && styles.bookButtonDisabled
            ]}
            onPress={handleBooking}
            disabled={isBooking || selectedSeats.length !== numberOfPeople}
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
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.text,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 16,
  },
  altarTopContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  columnContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
  },
  columnHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  columnSeats: {
    alignItems: 'center',
  },
  seatRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  seatLayoutHorizontal: {
    flex: 1,
  },
  seatLayoutContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  seatLayout: {
    flex: 1,
    paddingLeft: 16,
  },
  horizontalLayout: {
    flexDirection: 'column',
  },
  rowNumbersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 16,
  },
  rowLabelSpace: {
    width: 30,
    marginRight: 8,
  },
  columnHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowLabel: {
    width: 30,
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
    textAlign: 'center',
  },
  horizontalSeatsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  columnGroup: {
    flexDirection: 'row',
    flex: 1,
  },
  seat: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    marginVertical: 2,
  },
  seatPlaceholder: {
    width: 44,
    height: 44,
    marginHorizontal: 3,
    marginVertical: 2,
  },
  seatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  altarContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 16,
  },
  altar: {
    backgroundColor: colors.secondary,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 2,
  },
  altarDirection: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
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
