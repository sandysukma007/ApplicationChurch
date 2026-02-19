export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'jemaat' | 'pastor';
  created_at: string;
}

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

export interface Media {
  id: string;
  name: string;
  url: string;
  type: 'foto' | 'video' | 'dokumen';
  uploaded_by?: string;
  created_at: string;
}

export interface Mass {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  pastor?: string;
  created_at: string;
}

export interface Donation {
  id: string;
  user_id?: string;
  amount: number;
  method: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  media_url?: string;
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

export interface DonationFormData {
  amount: number;
  method: string;
}

// Seat Booking Types
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

export interface Reservation {
  id: string;
  mass_id: string;
  seat_id: string;
  user_id: string;
  number_of_people: number;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Joined data
  seat?: Seat;
}

export interface ReservationFormData {
  mass_id: string;
  seat_id: string;
  number_of_people: number;
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
