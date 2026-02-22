import { supabase } from '../supabaseClient';
import { MassQuota } from '../types';

// Get mass quota for a specific mass and floor
export const getMassQuota = async (massId: string, floorQuotaId: string): Promise<MassQuota | null> => {
  const { data, error } = await supabase
    .from('mass_quotas')
    .select('*')
    .eq('mass_id', massId)
    .eq('floor_quota_id', floorQuotaId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Get current mass quota first, then update with the new value
export const updateMassQuotaBooked = async (
  massId: string,
  floorQuotaId: string,
  numberOfPeople: number,
  operation: 'increment' | 'decrement'
): Promise<MassQuota> => {
  // First get current value
  const { data: current, error: fetchError } = await supabase
    .from('mass_quotas')
    .select('current_booked')
    .eq('mass_id', massId)
    .eq('floor_quota_id', floorQuotaId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const currentBooked = current?.current_booked || 0;
  const newBooked = operation === 'increment'
    ? currentBooked + numberOfPeople
    : Math.max(0, currentBooked - numberOfPeople);

  const { data, error } = await supabase
    .from('mass_quotas')
    .update({
      current_booked: newBooked,
      updated_at: new Date().toISOString()
    })
    .eq('mass_id', massId)
    .eq('floor_quota_id', floorQuotaId)
    .select()
    .single();

  if (error) {
    console.error('Error updating mass quota:', error);
    throw error;
  }
  return data;
};

// Recalculate and fix mass_quotas current_booked from actual reservations
// This can be used to fix any discrepancies
export const fixMassQuotasFromReservations = async (massId?: string): Promise<void> => {
  // Get all mass_quotas (optionally filtered by massId)
  let query = supabase
    .from('mass_quotas')
    .select('*');

  if (massId) {
    query = query.eq('mass_id', massId);
  }

  const { data: massQuotas, error: fetchError } = await query;
  if (fetchError) throw fetchError;
  if (!massQuotas) return;

  // For each mass_quota, calculate actual booked from reservations
  for (const mq of massQuotas) {
    const { data: reservations, error: resError } = await supabase
      .from('reservations')
      .select('number_of_people')
      .eq('mass_id', mq.mass_id)
      .eq('floor_quota_id', mq.floor_quota_id)
      .eq('status', 'confirmed');

    if (resError) {
      console.error('Error fetching reservations:', resError);
      continue;
    }

    const totalBooked = reservations?.reduce((sum, r) => sum + r.number_of_people, 0) || 0;

    const { error: updateError } = await supabase
      .from('mass_quotas')
      .update({
        current_booked: totalBooked,
        updated_at: new Date().toISOString()
      })
      .eq('mass_id', mq.mass_id)
      .eq('floor_quota_id', mq.floor_quota_id);

    if (updateError) {
      console.error('Error updating mass quota:', updateError);
    }
  }
};
