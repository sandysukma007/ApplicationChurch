import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loading } from '../components/Loading';
import { createReservation, getUserReservationForMass } from '../utils/api';
import { getFloorQuotasWithAvailability } from '../utils/floor_quotas';
import { FloorWithAvailability, Reservation } from '../types';
import { colors } from '../styles/theme';
import { MainStackParamList } from '../navigation/MainNavigator';

type BookingScreenRouteProp = RouteProp<MainStackParamList, 'Booking'>;
type BookingScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Booking'>;

export const BookingScreen_Kuota: React.FC = () => {
  const route = useRoute<BookingScreenRouteProp>();
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const { massId, massTitle, massDateTime } = route.params;

  const [floors, setFloors] = useState<FloorWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<FloorWithAvailability | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [userReservation, setUserReservation] = useState<Reservation | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    loadFloorQuotas();
  }, [massId]);

  const loadFloorQuotas = async () => {
    try {
      setLoading(true);
      const [floorData, reservationData] = await Promise.all([
        getFloorQuotasWithAvailability(massId),
        getUserReservationForMass(massId),
      ]);
      setFloors(floorData);
      setUserReservation(reservationData);

      // If user already has reservation, select that floor
      if (reservationData?.floor_quota_id) {
        const floor = floorData.find(f => f.id === reservationData.floor_quota_id);
        if (floor) {
          setSelectedFloor(floor);
          setNumberOfPeople(reservationData.number_of_people);
        }
      }
    } catch (error: any) {
      console.error('Error loading floor quotas:', error);
      Alert.alert('Error', 'Gagal memuat ketersediaan kuota');
    } finally {
      setLoading(false);
    }
  };

  const handleFloorSelect = (floor: FloorWithAvailability) => {
    // Check if floor is full
    if (floor.isFull) {
      Alert.alert('Info', `${floor.floor_name} sudah penuh`);
      return;
    }

    // Check if user already has reservation for a different floor
    if (userReservation && userReservation.floor_quota_id !== floor.id) {
      Alert.alert('Info', 'Anda sudah memiliki reservasi untuk Misa ini');
      return;
    }

    setSelectedFloor(floor);

    // Adjust number of people if it exceeds available
    if (numberOfPeople > floor.available) {
      setNumberOfPeople(floor.available);
    }
  };

  const handleNumberOfPeopleChange = (newCount: number) => {
    if (selectedFloor) {
      // Ensure we don't exceed available quota
      const maxAllowed = Math.min(newCount, selectedFloor.available);
      setNumberOfPeople(maxAllowed);
    } else {
      setNumberOfPeople(newCount);
    }
  };

  const handleBooking = async () => {
    if (!selectedFloor) {
      Alert.alert('Pilih Lantai', 'Silakan pilih lantai terlebih dahulu');
      return;
    }

    if (numberOfPeople < 1) {
      Alert.alert('Jumlah Orang', 'Silakan pilih minimal 1 orang');
      return;
    }

    try {
      setIsBooking(true);

      await createReservation({
        mass_id: massId,
        floor_quota_id: selectedFloor.id,
        number_of_people: numberOfPeople,
      });

      Alert.alert(
        'Berhasil!',
        `Reservasi berhasil!\n\nLantai: ${selectedFloor.floor_name}\nJumlah: ${numberOfPeople} orang\n\nSilakan datang tepat waktu untuk memudahkan verifikasi.`,
        [{
          text: 'Tutup',
          onPress: () => {
            loadFloorQuotas();
            setSelectedFloor(null);
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

  const getFloorStatusColor = (floor: FloorWithAvailability): string => {
    if (selectedFloor?.id === floor.id) return colors.primary;
    if (floor.isFull) return '#E74C3C';
    if (floor.percentageUsed >= 80) return '#F39C12';
    return '#27AE60';
  };

  const getFloorStatus = (floor: FloorWithAvailability): string => {
    if (floor.isFull) return 'Penuh';
    if (floor.percentageUsed >= 80) return 'Hampir Penuh';
    return 'Tersedia';
  };

  if (loading) {
    return <Loading />;
  }

  const renderFloorCard = (floor: FloorWithAvailability) => {
    const isSelected = selectedFloor?.id === floor.id;
    const statusColor = getFloorStatusColor(floor);
    const status = getFloorStatus(floor);

    return (
      <TouchableOpacity
        key={floor.id}
        style={[
          styles.floorCard,
          isSelected && styles.floorCardSelected,
          { borderColor: statusColor }
        ]}
        onPress={() => handleFloorSelect(floor)}
        disabled={floor.isFull || !!userReservation}
      >
        <View style={styles.floorHeader}>
          <Text style={styles.floorName}>{floor.floor_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        {floor.description && (
          <Text style={styles.floorDescription}>{floor.description}</Text>
        )}

        <View style={styles.floorStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Kapasitas</Text>
            <Text style={styles.statValue}>{floor.capacity}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Terpakai</Text>
            <Text style={styles.statValue}>{floor.capacity - floor.available}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tersedia</Text>
            <Text style={[styles.statValue, { color: statusColor }]}>{floor.available}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${floor.percentageUsed}%`,
                  backgroundColor: statusColor
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(floor.percentageUsed)}% terpakai</Text>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedIndicatorText}>✓ Dipilih</Text>
          </View>
        )}
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Pilih Kuota</Text>
          <Text style={styles.headerSubtitle}>{massTitle}</Text>
          <Text style={styles.headerDate}>
            {formatDate(massDateTime)} - {formatTime(massDateTime)}
          </Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {/* User Reservation Info */}
      {userReservation && userReservation.floor_quota && (
        <View style={styles.reservationInfo}>
          <Text style={styles.reservationTitle}>Reservasi Anda</Text>
          <Text style={styles.reservationDetail}>
            Lantai: {userReservation.floor_quota.floor_name}
          </Text>
          <Text style={styles.reservationDetail}>
            Jumlah: {userReservation.number_of_people} orang
          </Text>
        </View>
      )}

      {/* Floor Selection */}
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentContainer}>
        <Text style={styles.sectionTitle}>Pilih Lantai</Text>

        {floors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Belum ada lantai yang tersedia</Text>
          </View>
        ) : (
          floors.map(renderFloorCard)
        )}
      </ScrollView>

      {/* Booking Form */}
      {selectedFloor && !userReservation && (
        <View style={styles.bookingForm}>
          <View style={styles.selectedFloorInfo}>
            <Text style={styles.selectedFloorLabel}>Lantai Dipilih:</Text>
            <Text style={styles.selectedFloorValue}>{selectedFloor.floor_name}</Text>
            <Text style={styles.availableText}>
              Tersedia: {selectedFloor.available} orang
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
                style={[
                  styles.numberButton,
                  numberOfPeople >= selectedFloor.available && styles.numberButtonDisabled
                ]}
                onPress={() => handleNumberOfPeopleChange(Math.min(selectedFloor.available, numberOfPeople + 1))}
                disabled={numberOfPeople >= selectedFloor.available}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.bookButton,
              isBooking && styles.bookButtonDisabled,
            ]}
            onPress={handleBooking}
            disabled={isBooking || numberOfPeople < 1}
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
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  floorCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floorCardSelected: {
    borderWidth: 3,
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  floorDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  floorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedIndicatorText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  selectedFloorInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedFloorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedFloorValue: {
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
  numberButtonDisabled: {
    backgroundColor: colors.textLight,
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
