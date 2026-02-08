import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { getProfile, updateProfile } from '../utils/api';
import { ProfileFormData } from '../types';
import { supabase } from '../supabaseClient';
import DateTimePicker from '@react-native-community/datetimepicker';

export const ProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showBaptismDatePicker, setShowBaptismDatePicker] = useState(false);
  const [originalGender, setOriginalGender] = useState<string | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>({
    gender: 'male',
    birth_date: '',
    baptism_date: '',
    address: '',
    phone: '',
    family_card_number: '',
    region: '',
    community: '',
  } as ProfileFormData);
  const alertRef = useRef<CustomAlertRef>(null);

  const calculateCompleteness = (data: ProfileFormData) => {
    const fields = ['gender', 'birth_date', 'baptism_date', 'address', 'phone', 'family_card_number', 'region', 'community'];
    let filled = 0;
    fields.forEach(field => {
      if (data[field as keyof ProfileFormData] && data[field as keyof ProfileFormData] !== '') filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profileData = await getProfile(user.id);
        if (profileData) {
          const data: ProfileFormData = {
            gender: profileData.gender === 'male' ? 'male' : profileData.gender === 'female' ? 'female' : 'male',
            birth_date: profileData.birth_date || '',
            baptism_date: profileData.baptism_date || '',
            address: profileData.address || '',
            phone: profileData.phone || '',
            family_card_number: profileData.family_card_number || '',
            region: profileData.region || '',
            community: profileData.community || '',
          };
          setFormData(data);
          setOriginalGender(profileData.gender);
          setCompleteness(calculateCompleteness(data));
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
        alertRef.current?.show({ title: 'Berhasil', message: 'Profil berhasil diperbarui', type: 'success' });
        loadProfile();
      }
    } catch (error: any) {
      alertRef.current?.show({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onBirthDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowBirthDatePicker(Platform.OS === 'ios');
    const newData = { ...formData, birth_date: currentDate.toISOString().split('T')[0] };
    setFormData(newData);
    setCompleteness(calculateCompleteness(newData));
  };

  const onBaptismDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowBaptismDatePicker(Platform.OS === 'ios');
    const newData = { ...formData, baptism_date: currentDate.toISOString().split('T')[0] };
    setFormData(newData);
    setCompleteness(calculateCompleteness(newData));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.completenessContainer}>
        <Text style={styles.completenessText}>Kelengkapan Profil: {completeness}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completeness}%` }]} />
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Jenis Kelamin:</Text>
        <View style={styles.genderContainer}>
          <View style={styles.genderButtonWrapper}>
            <Button
              title="Laki-laki"
              onPress={() => {
                if (originalGender === null) {
                  const newData = { ...formData, gender: 'male' };
                  setFormData(newData);
                  setCompleteness(calculateCompleteness(newData));
                }
              }}
              variant={formData.gender === 'male' ? 'primary' : 'secondary'}
              size="small"
              disabled={originalGender !== null}
            />
          </View>
          <View style={styles.genderButtonWrapper}>
            <Button
              title="Perempuan"
              onPress={() => {
                if (originalGender === null) {
                  const newData = { ...formData, gender: 'female' };
                  setFormData(newData);
                  setCompleteness(calculateCompleteness(newData));
                }
              }}
              variant={formData.gender === 'female' ? 'primary' : 'secondary'}
              size="small"
              disabled={originalGender !== null}
            />
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowBirthDatePicker(true)} style={styles.dateInput}>
          <Input
            placeholder="Tanggal Lahir (YYYY-MM-DD)"
            value={formData.birth_date}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {showBirthDatePicker && (
          <DateTimePicker
            value={formData.birth_date ? new Date(formData.birth_date) : new Date()}
            mode="date"
            display="default"
            onChange={onBirthDateChange}
          />
        )}

        <TouchableOpacity onPress={() => setShowBaptismDatePicker(true)} style={styles.dateInput}>
          <Input
            placeholder="Tanggal Baptis (YYYY-MM-DD)"
            value={formData.baptism_date}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {showBaptismDatePicker && (
          <DateTimePicker
            value={formData.baptism_date ? new Date(formData.baptism_date) : new Date()}
            mode="date"
            display="default"
            onChange={onBaptismDateChange}
          />
        )}

        <Input
          placeholder="Alamat"
          value={formData.address}
          onChangeText={(text) => {
            const newData = { ...formData, address: text };
            setFormData(newData);
            setCompleteness(calculateCompleteness(newData));
          }}
        />

        <Input
          placeholder="Telepon"
          value={formData.phone}
          onChangeText={(text) => {
            const newData = { ...formData, phone: text };
            setFormData(newData);
            setCompleteness(calculateCompleteness(newData));
          }}
          keyboardType="phone-pad"
        />

        <Input
          placeholder="Nomor Kartu Keluarga"
          value={formData.family_card_number}
          onChangeText={(text) => {
            const newData = { ...formData, family_card_number: text };
            setFormData(newData);
            setCompleteness(calculateCompleteness(newData));
          }}
        />

        <Input
          placeholder="Wilayah"
          value={formData.region}
          onChangeText={(text) => {
            const newData = { ...formData, region: text };
            setFormData(newData);
            setCompleteness(calculateCompleteness(newData));
          }}
        />

        <Input
          placeholder="Komunitas"
          value={formData.community}
          onChangeText={(text) => {
            const newData = { ...formData, community: text };
            setFormData(newData);
            setCompleteness(calculateCompleteness(newData));
          }}
        />

        <Button title="Simpan Profil" onPress={handleSave} loading={saving} variant="gradient" />
      </View>
      <CustomAlert ref={alertRef} />
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
  completenessContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
  },
  completenessText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
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
  genderButtonWrapper: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
  },
  dateInput: {
    marginVertical: 8,
  },
});
