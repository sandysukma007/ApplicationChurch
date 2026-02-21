import { supabase } from '../supabaseClient';
import { Reservation, ReservationFormData } from '../types';

// Get all reservations for a specific mass
export const getReservationsByMass = async (massId: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, seat:seats(*), floor_quota:floor_quotas(*)')
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
    .select('*, seat:seats(*), floor_quota:floor_quotas(*)')
    .eq('mass_id', massId)
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Get user's all reservations
export const getUserReservations = async (): Promise<Reservation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('reservations')
    .select('*, seat:seats(*), floor_quota:floor_quotas(*), mass:masses(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Create a new seat-based reservation (legacy)
export const createSeatReservation = async (reservationData: ReservationFormData): Promise<Reservation> => {
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

// Create a new quota-based reservation
export const createQuotaReservation = async (reservationData: ReservationFormData): Promise<Reservation> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      mass_id: reservationData.mass_id,
      floor_quota_id: reservationData.floor_quota_id,
      user_id: user.id,
      number_of_people: reservationData.number_of_people,
      status: 'confirmed',
    })
    .select('*, floor_quota:floor_quotas(*)')
    .single();
  if (error) throw error;
  return data;
};

// Create a new reservation (auto-detect type)
export const createReservation = async (reservationData: ReservationFormData): Promise<Reservation> => {
  if (reservationData.floor_quota_id) {
    return createQuotaReservation(reservationData);
  }
  return createSeatReservation(reservationData);
};

// Cancel a reservation
export const cancelReservation = async (reservationId: string): Promise<void> => {
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reservationId);
  if (error) throw error;
};

// Delete a reservation
export const deleteReservation = async (reservationId: string): Promise<void> => {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId);
  if (error) throw error;
};
