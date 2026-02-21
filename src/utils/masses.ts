import { supabase } from '../supabaseClient';
import { Mass } from '../types';

// Get all masses
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

// Get masses with imam data
export const getMassesWithImam = async (): Promise<Mass[]> => {
  const { data, error } = await supabase
    .from('masses')
    .select('*, imam:imams(*)')
    .order('date_time', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Get mass by ID
export const getMassById = async (massId: string): Promise<Mass | null> => {
  const { data, error } = await supabase
    .from('masses')
    .select('*, imam:imams(*)')
    .eq('id', massId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Create a new mass
export const createMass = async (massData: Partial<Mass>): Promise<Mass> => {
  const { data, error } = await supabase
    .from('masses')
    .insert(massData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update a mass
export const updateMass = async (massId: string, massData: Partial<Mass>): Promise<Mass> => {
  const { data, error } = await supabase
    .from('masses')
    .update(massData)
    .eq('id', massId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a mass
export const deleteMass = async (massId: string): Promise<void> => {
  const { error } = await supabase
    .from('masses')
    .delete()
    .eq('id', massId);
  if (error) throw error;
};
