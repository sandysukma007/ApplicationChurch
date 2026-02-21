// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'jemaat' | 'pastor';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'jemaat' | 'pastor';
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile Types
export interface Profile {
  id: string;
  gender: 'male' | 'female';
  birth_date?: string;
  baptism_date?: string;
  address?: string;
  phone?: string;
  parish: string;
  family_card_number?: string;
  region?: string;
  community?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  gender: 'male' | 'female';
  birth_date?: string;
  baptism_date?: string;
  address?: string;
  phone?: string;
  family_card_number?: string;
  region?: string;
  community?: string;
}

// Mass Types
export interface Mass {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  pastor?: string;
  imam_id?: string;
  created_at: string;
  // Joined data
  imam?: Imam;
}

// Imam Types
export interface Imam {
  id: string;
  full_name: string;
  religious_order?: string;
  title?: string;
  status?: string;
  position?: string;
  address?: string;
  birth_place?: string;
  birth_date?: string;
  ordination_date?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// Quota Booking Types (replaces seat-based booking)
export interface FloorQuota {
  id: string;
  floor_name: string;
  floor_number: number;
  capacity: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MassQuota {
  id: string;
  mass_id: string;
  floor_quota_id: string;
  current_booked: number;
  created_at: string;
  updated_at: string;
  // Joined data
  floor_quota?: FloorQuota;
}

export interface FloorWithAvailability extends FloorQuota {
  available: number;
  isFull: boolean;
  percentageUsed: number;
}

// Seat Booking Types (legacy - kept for backward compatibility)
export interface Seat {
  id: string;
  column_name: 'A' | 'B' | 'C';
  row_number: 1 | 2;
  seat_number: number;
  capacity: number;
  created_at: string;
}

export interface SeatAvailability {
  seat_id: string;
  column_name: 'A' | 'B' | 'C';
  row_number: 1 | 2;
  seat_number: number;
  capacity: number;
  booked_count: number;
  available_count: number;
}

// Reservation Types
export interface Reservation {
  id: string;
  mass_id: string;
  seat_id?: string;
  floor_quota_id?: string;
  user_id: string;
  number_of_people: number;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Joined data
  seat?: Seat;
  floor_quota?: FloorQuota;
}

export interface ReservationFormData {
  mass_id: string;
  seat_id?: string;
  floor_quota_id?: string;
  number_of_people: number;
}

// Donation Types
export interface Donation {
  id: string;
  user_id?: string;
  amount: number;
  method: string;
  created_at: string;
}

export interface DonationFormData {
  amount: number;
  method: string;
}

// Media Types
export interface Media {
  id: string;
  name: string;
  url: string;
  type: 'foto' | 'video' | 'dokumen';
  uploaded_by?: string;
  created_at: string;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  media_url?: string;
  created_at: string;
}

// Form Types
export type FormCategory = 'Sakramen' | 'Perkawinan' | 'Administrasi' | 'Lainnya';

export interface Form {
  id: string;
  title: string;
  code?: string;
  description?: string;
  file_url?: string;
  file_path?: string;
  file_name?: string;
  category: FormCategory;
  icon: string;
  gradient_colors: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
