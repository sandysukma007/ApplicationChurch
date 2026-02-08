import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { Loading } from '../components/Loading';
import { supabase } from '../supabaseClient';
import { User } from '../types';

const Stack = createNativeStackNavigator();

// Simple mapping dari Supabase user_metadata
const mapSessionToUser = (session: any): User | null => {
  if (!session?.user) return null;

  const { user } = session;

  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || '',
    role: user.user_metadata?.role || 'jemaat',
    created_at: user.created_at || new Date().toISOString(),
  };
};

export const RootNavigator: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsReset, setNeedsReset] = useState(false);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = mapSessionToUser(session);
      const needs = await AsyncStorage.getItem('needsPasswordReset');
      if (needs === 'true') {
        setNeedsReset(true);
        await AsyncStorage.removeItem('needsPasswordReset');
      }
      setUser(currentUser);
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = mapSessionToUser(session);
        setUser(currentUser);

        // Check for password reset flag when auth state changes
        if (currentUser) {
          const needs = await AsyncStorage.getItem('needsPasswordReset');
          if (needs === 'true') {
            setNeedsReset(true);
            await AsyncStorage.removeItem('needsPasswordReset');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && navigationRef.current) {
      if (user && needsReset) {
        navigationRef.current.navigate('ResetPassword');
      } else if (user) {
        navigationRef.current.navigate('Main');
      } else {
        navigationRef.current.navigate('Auth');
      }
    }
  }, [loading, user, needsReset]);

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
