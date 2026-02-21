import { supabase } from '../supabaseClient';
import { Announcement } from '../types';

// Get all announcements
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Get active announcements only
export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Get announcement by ID
export const getAnnouncementById = async (announcementId: string): Promise<Announcement | null> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', announcementId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Create a new announcement
export const createAnnouncement = async (announcementData: Partial<Announcement>): Promise<Announcement> => {
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcementData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update an announcement
export const updateAnnouncement = async (announcementId: string, announcementData: Partial<Announcement>): Promise<Announcement> => {
  const { data, error } = await supabase
    .from('announcements')
    .update(announcementData)
    .eq('id', announcementId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete an announcement
export const deleteAnnouncement = async (announcementId: string): Promise<void> => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId);
  if (error) throw error;
};
