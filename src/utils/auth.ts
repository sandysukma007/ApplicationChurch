import { supabase } from '../supabaseClient';
import { LoginCredentials, RegisterData } from '../types';

export const login = async (credentials: LoginCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  if (error) throw error;

  // Check if profile exists, if not, create one
  const { error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user?.id)
    .single();

  if (profileError && profileError.code === 'PGRST116') { // No rows returned
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: data.user?.id,
        gender: 'male',
        parish: 'Paroki Santa Clara',
      });
    if (insertError) throw insertError;
  } else if (profileError) {
    throw profileError;
  }

  return data;
};

export const register = async (data: RegisterData) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (authError) throw authError;

  // Insert user data into users table
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user?.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
    });
  if (userError) throw userError;

  return authData;
};

export const sendVerificationCode = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // For forgot password, user exists
    },
  });
  if (error) throw error;
};

export const verifyCode = async (email: string, code: string, type: 'recovery' | 'signup') => {
  // Use Supabase's built-in verifyOtp for both recovery and signup
  // For recovery (password reset), use 'recovery' type to avoid auto-login
  const otpType = type === 'recovery' ? 'recovery' : type;
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: otpType,
  });
  if (error) throw error;
  return data;
};

export const resetPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};
