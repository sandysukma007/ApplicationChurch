import { supabase } from '../supabaseClient';
import { Form, FormCategory } from '../types';

// Get all forms
export const getForms = async (): Promise<Form[]> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Get forms by category
export const getFormsByCategory = async (category: FormCategory): Promise<Form[]> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
};

// Get form by ID
export const getFormById = async (formId: string): Promise<Form | null> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

// Create a new form
export const createForm = async (formData: Partial<Form>): Promise<Form> => {
  const { data, error } = await supabase
    .from('forms')
    .insert(formData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update a form
export const updateForm = async (formId: string, formData: Partial<Form>): Promise<Form> => {
  const { data, error } = await supabase
    .from('forms')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', formId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a form (soft delete - set is_active to false)
export const deleteForm = async (formId: string): Promise<void> => {
  const { error } = await supabase
    .from('forms')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', formId);
  if (error) throw error;
};
