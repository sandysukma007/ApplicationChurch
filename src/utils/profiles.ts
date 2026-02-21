import { supabase } from '../supabaseClient';
import { Profile, ProfileFormData } from '../types';

// Get profile by user ID
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId);
  if (error) throw error;
  return data ? data[0] : null;
};

// Get current user's profile
export const getCurrentProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getProfile(user.id);
};

// Update profile
export const updateProfile = async (userId: string, profileData: ProfileFormData): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Create or update current user's profile
export const updateCurrentProfile = async (profileData: ProfileFormData): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return updateProfile(user.id, profileData);
};

// Delete profile
export const deleteProfile = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
};
