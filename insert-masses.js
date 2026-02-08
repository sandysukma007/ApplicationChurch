import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfzogyvptnwmoqfmyhlx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6eWZ6b2d5dnB0bndtb3FmeWhseCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5OTU3MDgzLCJleHAiOjIwODU1MzMwODN9.PqF3aGhmvzwZm2OJf_gJnvpRC_V-S5fVTONNIBpFsHI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertMasses() {
  const masses = [
    { title: 'Misa Harian di Hari Sabtu Jam 5 Sore', date_time: '2024-10-12 17:00:00' },
    { title: 'Misa Harian di Hari Minggu jam 6 pagi', date_time: '2024-10-13 06:00:00' },
    { title: 'Misa Harian di Hari Minggu jam 9 pagi', date_time: '2024-10-13 09:00:00' },
    { title: 'Misa Harian di Hari Minggu jam 5 sore', date_time: '2024-10-13 17:00:00' },
  ];

  for (const mass of masses) {
    const { data, error } = await supabase
      .from('masses')
      .insert(mass);
    if (error) {
      console.error('Error inserting mass:', error);
    } else {
      console.log('Inserted:', data);
    }
  }
}

insertMasses();
