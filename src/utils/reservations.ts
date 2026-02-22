import { supabase } from '../supabaseClient';
import { Reservation, ReservationFormData } from '../types';
import { updateMassQuotaBooked } from './mass_quotas';

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
  if (!reservationData.floor_quota_id) {
    throw new Error('floor_quota_id is required for quota-based reservation');
  }

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

  // Manually update the mass quota as a fallback in case the database trigger doesn't work
  // This ensures current_booked is always updated when a reservation is made
  try {
    await updateMassQuotaBooked(
      reservationData.mass_id,
      reservationData.floor_quota_id,
      reservationData.number_of_people,
      'increment'
    );
  } catch (quotaError) {
    console.error('Warning: Failed to update mass quota:', quotaError);
    // Don't throw error - the reservation was created successfully
  }

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
  // First get the reservation to know the floor_quota and number_of_people
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reservationId);
  if (error) throw error;

  // Manually update the mass quota to decrement the booked count
  if (reservation?.floor_quota_id && reservation?.number_of_people) {
    try {
      await updateMassQuotaBooked(
        reservation.mass_id,
        reservation.floor_quota_id,
        reservation.number_of_people,
        'decrement'
      );
    } catch (quotaError) {
      console.error('Warning: Failed to update mass quota:', quotaError);
    }
  }
};

// Delete a reservation
export const deleteReservation = async (reservationId: string): Promise<void> => {
  // First get the reservation to know the floor_quota and number_of_people
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId);
  if (error) throw error;

  // Manually update the mass quota to decrement the booked count
  if (reservation?.floor_quota_id && reservation?.number_of_people) {
    try {
      await updateMassQuotaBooked(
        reservation.mass_id,
        reservation.floor_quota_id,
        reservation.number_of_people,
        'decrement'
      );
    } catch (quotaError) {
      console.error('Warning: Failed to update mass quota:', quotaError);
    }
  }
};

// Get user's reservation for a specific date (any mass on that date)
export const getUserReservationForDate = async (massDateTime: string): Promise<Reservation | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Extract the date part from the mass datetime
  const massDate = new Date(massDateTime).toISOString().split('T')[0];

  // Get all user's confirmed reservations with mass data
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('*, mass:masses(date_time), floor_quota:floor_quotas(*)')
    .eq('user_id', user.id)
    .eq('status', 'confirmed');

  if (error) throw error;
  if (!reservations || reservations.length === 0) return null;

  // Check if any reservation is on the same date
  const reservationOnSameDate = reservations.find(res => {
    if (!res.mass?.date_time) return false;
    const resDate = new Date(res.mass.date_time).toISOString().split('T')[0];
    return resDate === massDate;
  });

  return reservationOnSameDate || null;
};

// Get all user's reservations for a specific date
export const getUserReservationsForDate = async (massDateTime: string): Promise<Reservation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Extract the date part from the mass datetime
  const massDate = new Date(massDateTime).toISOString().split('T')[0];

  // Get all user's confirmed reservations with mass data
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('*, mass:masses(date_time, title), floor_quota:floor_quotas(*)')
    .eq('user_id', user.id)
    .eq('status', 'confirmed');

  if (error) throw error;
  if (!reservations || reservations.length === 0) return [];

  // Filter reservations on the same date
  return reservations.filter(res => {
    if (!res.mass?.date_time) return false;
    const resDate = new Date(res.mass.date_time).toISOString().split('T')[0];
    return resDate === massDate;
  });
};
