import { supabase } from '../supabaseClient';
import { FloorQuota, MassQuota, FloorWithAvailability } from '../types';

// Get all floor quotas
export const getFloorQuotas = async (): Promise<FloorQuota[]> => {
  const { data, error } = await supabase
    .from('floor_quotas')
    .select('*')
    .eq('is_active', true)
    .order('floor_number', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Get floor quota by ID
export const getFloorQuotaById = async (floorQuotaId: string): Promise<FloorQuota | null> => {
  const { data, error } = await supabase
    .from('floor_quotas')
    .select('*')
    .eq('id', floorQuotaId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Get floor quotas with availability for a specific mass
export const getFloorQuotasWithAvailability = async (massId: string): Promise<FloorWithAvailability[]> => {
  // First get all active floor quotas
  const { data: floorQuotas, error: floorError } = await supabase
    .from('floor_quotas')
    .select('*')
    .eq('is_active', true)
    .order('floor_number', { ascending: true });

  if (floorError) throw floorError;
  if (!floorQuotas) return [];

  // Then get mass quotas for this mass
  const { data: massQuotas, error: massError } = await supabase
    .from('mass_quotas')
    .select('*')
    .eq('mass_id', massId);

  if (massError) throw massError;

  // Map floor quotas with their current availability
  const result: FloorWithAvailability[] = floorQuotas.map(floor => {
    const massQuota = massQuotas?.find(mq => mq.floor_quota_id === floor.id);
    const currentBooked = massQuota?.current_booked || 0;
    const available = floor.capacity - currentBooked;

    return {
      ...floor,
      available,
      isFull: available <= 0,
      percentageUsed: floor.capacity > 0 ? (currentBooked / floor.capacity) * 100 : 0,
    };
  });

  return result;
};

// Create a new floor quota
export const createFloorQuota = async (floorQuotaData: Partial<FloorQuota>): Promise<FloorQuota> => {
  const { data, error } = await supabase
    .from('floor_quotas')
    .insert(floorQuotaData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update a floor quota
export const updateFloorQuota = async (floorQuotaId: string, floorQuotaData: Partial<FloorQuota>): Promise<FloorQuota> => {
  const { data, error } = await supabase
    .from('floor_quotas')
    .update({ ...floorQuotaData, updated_at: new Date().toISOString() })
    .eq('id', floorQuotaId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a floor quota (soft delete - set is_active to false)
export const deleteFloorQuota = async (floorQuotaId: string): Promise<void> => {
  const { error } = await supabase
    .from('floor_quotas')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', floorQuotaId);
  if (error) throw error;
};

// Get mass quotas for a specific mass
export const getMassQuotas = async (massId: string): Promise<MassQuota[]> => {
  const { data, error } = await supabase
    .from('mass_quotas')
    .select('*, floor_quotas(*)')
    .eq('mass_id', massId);
  if (error) throw error;
  return data || [];
};
