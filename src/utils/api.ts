import { supabase } from '../supabaseClient';
import { Profile, Media, Mass, Donation, Announcement, ProfileFormData, DonationFormData } from '../types';

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
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
