import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfzogyvptnwmoqfmyhlx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmem9neXZwdG53bW9xZm15aGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NTcwODMsImV4cCI6MjA4NTUzMzA4M30.PqF3aGhmvzwZm2OJf_gJnvpRC_V-S5fVTONNIBpFsHI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
