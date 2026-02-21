import { supabase } from '../supabaseClient';
import { Media } from '../types';

// Get all media
export const getMedia = async (): Promise<Media[]> => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Get media by type
export const getMediaByType = async (type: 'foto' | 'video' | 'dokumen'): Promise<Media[]> => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// Get media by ID
export const getMediaById = async (mediaId: string): Promise<Media | null> => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', mediaId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Upload media
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

// Delete media
export const deleteMedia = async (mediaId: string): Promise<void> => {
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId);
  if (error) throw error;
};
