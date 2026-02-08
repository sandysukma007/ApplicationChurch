import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image } from 'react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { ListItem } from '../components/ListItem';
import { CustomAlert, CustomAlertRef } from '../components/CustomAlert';
import { createDonation, getUserDonations } from '../utils/api';
import { Donation, DonationFormData } from '../types';

export const DonationsScreen: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DonationFormData>({
    amount: 0,
    method: '',
  });
  const [errors, setErrors] = useState<{ amount?: string; method?: string }>({});
  const alertRef = useRef<CustomAlertRef>(null);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const data = await getUserDonations();
      setDonations(data);
    } catch (error: any) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { amount?: string; method?: string } = {};
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.method) newErrors.method = 'Payment method is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createDonation(formData);
      alertRef.current?.show({ title: 'Success', message: 'Donation submitted successfully', type: 'success' });
      setFormData({ amount: 0, method: '' });
      setShowForm(false);
      loadDonations();
    } catch (error: any) {
      alertRef.current?.show({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png')} style={styles.logo} />
        <Text style={styles.title}>Donations</Text>
        <Button
          title={showForm ? 'Cancel' : 'Make Donation'}
          onPress={() => setShowForm(!showForm)}
          variant="secondary"
        />
      </View>

      {showForm && (
        <View style={styles.form}>
          <Input
            placeholder="Amount"
            value={formData.amount.toString()}
            onChangeText={(text) => setFormData({ ...formData, amount: parseFloat(text) || 0 })}
            keyboardType="numeric"
            error={errors.amount}
          />
          <Input
            placeholder="Payment Method (e.g., Transfer, Cash)"
            value={formData.method}
            onChangeText={(text) => setFormData({ ...formData, method: text })}
            error={errors.method}
          />
          <Button title="Submit Donation" onPress={handleSubmit} loading={submitting} />
        </View>
      )}

      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            title={formatCurrency(item.amount)}
            subtitle={`Method: ${item.method}\nDate: ${formatDate(item.created_at)}`}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No donations yet</Text>
          </View>
        }
      />
      <CustomAlert ref={alertRef} />
    </View>
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
    marginBottom: 10,
  },
  form: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
