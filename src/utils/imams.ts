import { supabase } from '../supabaseClient';
import { Imam } from '../types';

// Get all imams
export const getImams = async (): Promise<Imam[]> => {
  const { data, error } = await supabase
    .from('imams')
    .select('*')
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Get active imams only
export const getActiveImams = async (): Promise<Imam[]> => {
  const { data, error } = await supabase
    .from('imams')
    .select('*')
    .eq('status', 'active')
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Get imam by ID
export const getImamById = async (imamId: string): Promise<Imam | null> => {
  const { data, error } = await supabase
    .from('imams')
    .select('*')
    .eq('id', imamId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Create a new imam
export const createImam = async (imamData: Partial<Imam>): Promise<Imam> => {
  const { data, error } = await supabase
    .from('imams')
    .insert(imamData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update an imam
export const updateImam = async (imamId: string, imamData: Partial<Imam>): Promise<Imam> => {
  const { data, error } = await supabase
    .from('imams')
    .update({ ...imamData, updated_at: new Date().toISOString() })
    .eq('id', imamId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete an imam
export const deleteImam = async (imamId: string): Promise<void> => {
  const { error } = await supabase
    .from('imams')
    .delete()
    .eq('id', imamId);
  if (error) throw error;
};
