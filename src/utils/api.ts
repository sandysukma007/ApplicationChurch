import { supabase } from '../supabaseClient';
import { Profile, Media, Mass, Donation, Announcement, ProfileFormData, DonationFormData, SeatAvailability, Reservation, ReservationFormData } from '../types';

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId);
  if (error) throw error;
  return data ? data[0] : null;
};

export const updateProfile = async (userId: string, profileData: ProfileFormData): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getMasses = async (): Promise<Mass[]> => {
  const { data, error } = await supabase
    .from('masses')
    .select('*')
    .order('date_time', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Get masses within the next 2 days (for reminder feature)
export const getUpcomingMasses = async (): Promise<Mass[]> => {
  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days in milliseconds

  const { data, error } = await supabase
    .from('masses')
    .select('*')
    .gte('date_time', now.toISOString())
    .lte('date_time', twoDaysLater.toISOString())
    .order('date_time', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createDonation = async (donationData: DonationFormData): Promise<Donation> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('donations')
    .insert({ ...donationData, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getUserDonations = async (): Promise<Donation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getMedia = async (): Promise<Media[]> => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const uploadMedia = async (file: any, name: string, type: 'foto' | 'video' | 'dokumen'): Promise<Media> => {
  const { data: { user } } = await supabase.auth.getUser();
  const fileExt = name.split('.').pop();
  const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('media')
    .insert({
      name,
      url: urlData.publicUrl,
      type,
      uploaded_by: user?.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Seat Booking API Functions

// Get seat availability for a specific mass using the database function
export const getSeatAvailability = async (massId: string): Promise<SeatAvailability[]> => {
  const { data, error } = await supabase
    .rpc('get_seat_availability', { mass_id: massId });
  if (error) throw error;
  return data || [];
};

// Get all reservations for a specific mass
export const getReservationsByMass = async (massId: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, seat:seats(*)')
    .eq('mass_id', massId)
    .eq('status', 'confirmed');
  if (error) throw error;
  return data || [];
};

// Get user's reservations for a specific mass
export const getUserReservationForMass = async (massId: string): Promise<Reservation | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('reservations')
    .select('*, seat:seats(*)')
    .eq('mass_id', massId)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Create a new reservation
export const createReservation = async (reservationData: ReservationFormData): Promise<Reservation> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      mass_id: reservationData.mass_id,
      seat_id: reservationData.seat_id,
      user_id: user.id,
      number_of_people: reservationData.number_of_people,
      status: 'confirmed',
    })
    .select('*, seat:seats(*)')
    .single();
  if (error) throw error;
  return data;
};

// Cancel a reservation
export const cancelReservation = async (reservationId: string): Promise<void> => {
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reservationId);
  if (error) throw error;
};
