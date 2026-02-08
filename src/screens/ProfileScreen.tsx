import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, Linking } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { getProfile, updateProfile } from '../utils/api';
import { ProfileFormData } from '../types';
import { supabase } from '../supabaseClient';

export const ProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    gender: 'male',
    birth_date: '',
    baptism_date: '',
    address: '',
    phone: '',
    family_card_number: '',
    region: '',
    community: '',
  });
  const alertRef = useRef<CustomAlertRef>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profileData = await getProfile(user.id);
        if (profileData) {
          setProfile(profileData);
          setFormData({
            gender: profileData.gender,
            birth_date: profileData.birth_date || '',
            baptism_date: profileData.baptism_date || '',
            address: profileData.address || '',
            phone: profileData.phone || '',
            family_card_number: profileData.family_card_number || '',
            region: profileData.region || '',
            community: profileData.community || '',
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await updateProfile(user.id, formData);
        alertRef.current?.show({ title: 'Success', message: 'Profile updated successfully', type: 'success' });
        loadProfile();
      }
    } catch (error: any) {
      alertRef.current?.show({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Gender:</Text>
        <View style={styles.genderContainer}>
          <Button
            title="Male"
            onPress={() => setFormData({ ...formData, gender: 'male' })}
            variant={formData.gender === 'male' ? 'primary' : 'secondary'}
          />
          <Button
            title="Female"
            onPress={() => setFormData({ ...formData, gender: 'female' })}
            variant={formData.gender === 'female' ? 'primary' : 'secondary'}
          />
        </View>

        <Input
          placeholder="Birth Date (YYYY-MM-DD)"
          value={formData.birth_date}
          onChangeText={(text) => setFormData({ ...formData, birth_date: text })}
        />

        <Input
          placeholder="Baptism Date (YYYY-MM-DD)"
          value={formData.baptism_date}
          onChangeText={(text) => setFormData({ ...formData, baptism_date: text })}
        />

        <Input
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
        />

        <Input
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <Input
          placeholder="Family Card Number"
          value={formData.family_card_number}
          onChangeText={(text) => setFormData({ ...formData, family_card_number: text })}
        />

        <Input
          placeholder="Region"
          value={formData.region}
          onChangeText={(text) => setFormData({ ...formData, region: text })}
        />

        <Input
          placeholder="Community"
          value={formData.community}
          onChangeText={(text) => setFormData({ ...formData, community: text })}
        />

        <Button title="Save Profile" onPress={handleSave} loading={saving} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});
