import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { MassesScreen } from '../screens/MassesScreen';
import { DonationsScreen } from '../screens/DonationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AnnouncementsScreen } from '../screens/AnnouncementsScreen';
import { MediaScreen } from '../screens/MediaScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';

export type MainStackParamList = {
  Home: undefined;
  Masses: undefined;
  Donations: undefined;
  Profile: undefined;
  Announcements: undefined;
  Media: undefined;
  ResetPassword: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Masses" component={MassesScreen} options={{ title: 'Jadwal Misa' }} />
      <Stack.Screen name="Donations" component={DonationsScreen} options={{ title: 'Donasi' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Pengumuman' }} />
      <Stack.Screen name="Media" component={MediaScreen} options={{ title: 'Media' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
};
