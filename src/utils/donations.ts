import { supabase } from '../supabaseClient';
import { Donation, DonationFormData } from '../types';

// Create a new donation
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

// Get user's donations
export const getUserDonations = async (): Promise<Donation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Get all donations (admin only)
export const getAllDonations = async (): Promise<Donation[]> => {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Get donation by ID
export const getDonationById = async (donationId: string): Promise<Donation | null> => {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('id', donationId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Update donation
export const updateDonation = async (donationId: string, donationData: Partial<DonationFormData>): Promise<Donation> => {
  const { data, error } = await supabase
    .from('donations')
    .update(donationData)
    .eq('id', donationId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete donation
export const deleteDonation = async (donationId: string): Promise<void> => {
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', donationId);
  if (error) throw error;
};
