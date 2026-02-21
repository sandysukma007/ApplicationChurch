import React, { Suspense, lazy } from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { MassesScreen } from '../screens/MassesScreen';
import { DonationsScreen } from '../screens/DonationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AnnouncementsScreen } from '../screens/AnnouncementsScreen';
import { MediaScreen } from '../screens/MediaScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { ProfileGerejaScreen } from '../screens/ProfileGerejaScreen';
import { ArahDasarScreen } from '../screens/ArahDasarScreen';
import { DewanParokiScreen } from '../screens/DewanParokiScreen';
import { FilosofiLogoScreen } from '../screens/FilosofiLogoScreen';
import { ProfilImamScreen } from '../screens/ProfilImamScreen';
import { SantaClaraAssisiScreen } from '../screens/SantaClaraAssisiScreen';
import { SejarahGerejaScreen } from '../screens/SejarahGerejaScreen';
import { SeksiScreen } from '../screens/SeksiScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { KumpulanFormulirScreen } from '../screens/KumpulanFormulirScreen';

// Lazy load to prevent circular dependency
const BaptisBayiFormScreen = lazy(() => import('../screens/BaptisBayiFormScreen').then(module => ({ default: module.BaptisBayiFormScreen })));


export type MainStackParamList = {
  Home: undefined;
  Masses: undefined;
  Donations: undefined;
  Profile: undefined;
  Announcements: undefined;
  Media: undefined;
  ResetPassword: undefined;
  ProfileGereja: undefined;
  ArahDasar: undefined;
  DewanParoki: undefined;
  FilosofiLogo: undefined;
  ProfilImam: undefined;
  SantaClaraAssisi: undefined;
  SejarahGereja: undefined;
  Seksi: undefined;
  Booking: {
    massId: string;
    massTitle: string;
    massDateTime: string;
  };
  KumpulanFormulir: undefined;
  BaptisBayiForm: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Masses" component={MassesScreen} options={{ title: 'Jadwal Misa' }} />
      <Stack.Screen name="Donations" component={DonationsScreen} options={{ title: 'Donasi' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Pengumuman' }} />
      <Stack.Screen name="Media" component={MediaScreen} options={{ title: 'Media' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
      <Stack.Screen name="ProfileGereja" component={ProfileGerejaScreen} options={{ title: 'Profile Gereja' }} />
      <Stack.Screen name="ArahDasar" component={ArahDasarScreen} options={{ title: 'Arah Dasar' }} />
      <Stack.Screen name="DewanParoki" component={DewanParokiScreen} options={{ title: 'Dewan Paroki' }} />
      <Stack.Screen name="FilosofiLogo" component={FilosofiLogoScreen} options={{ title: 'Filosofi Logo' }} />
      <Stack.Screen name="ProfilImam" component={ProfilImamScreen} options={{ title: 'Profil Imam' }} />
      <Stack.Screen name="SantaClaraAssisi" component={SantaClaraAssisiScreen} options={{ title: 'Santa Clara' }} />
      <Stack.Screen name="SejarahGereja" component={SejarahGerejaScreen} options={{ title: 'Sejarah Gereja' }} />
      <Stack.Screen name="Seksi" component={SeksiScreen} options={{ title: 'Seksi' }} />
<Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Pilih Kuota', headerShown: false }} />
      <Stack.Screen name="KumpulanFormulir" component={KumpulanFormulirScreen} options={{ title: 'Kumpulan Formulir' }} />
      <Stack.Screen
        name="BaptisBayiForm"
        options={{ title: 'Form Baptis Bayi' }}
      >
        {props => (
          <Suspense fallback={null}>
            <BaptisBayiFormScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>

    </Stack.Navigator>
  );
};
