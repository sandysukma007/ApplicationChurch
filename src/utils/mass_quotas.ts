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
): Promise<MassQuota | null> => {
  // First get current quota record
  const { data: current, error: fetchError } = await supabase
    .from('mass_quotas')
    .select('*')
    .eq('mass_id', massId)
    .eq('floor_quota_id', floorQuotaId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching mass quota:', fetchError);
    throw fetchError;
  }

  // If no record exists
  if (!current) {
    if (operation === 'increment') {
      // Create new quota record with initial values
      const { data: newQuota, error: insertError } = await supabase
        .from('mass_quotas')
        .insert({
          mass_id: massId,
          floor_quota_id: floorQuotaId,
          current_booked: numberOfPeople,
          max_quota: 0,
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error creating mass quota:', insertError);
        throw insertError;
      }
      return newQuota;
    } else {
      // Decrement on non-existent record - throw descriptive error
      throw new Error(`Mass quota record not found for mass_id: ${massId}, floor_quota_id: ${floorQuotaId}`);
    }
  }

  // Calculate new booked value
  const currentBooked = current.current_booked || 0;
  const newBooked = operation === 'increment'
    ? currentBooked + numberOfPeople
    : Math.max(0, currentBooked - numberOfPeople);

  // Update the existing record
  const { data, error } = await supabase
    .from('mass_quotas')
    .update({
      current_booked: newBooked,
      updated_at: new Date().toISOString()
    })
    .eq('mass_id', massId)
    .eq('floor_quota_id', floorQuotaId)
    .select()
    .maybeSingle();

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
