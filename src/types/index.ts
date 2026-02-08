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
