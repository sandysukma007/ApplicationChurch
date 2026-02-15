import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/theme';

interface ProfileGerejaScreenProps {
  navigation: any;
}

const menuItems = [
  { id: 1, title: 'Arah Dasar Keuskupan Agung Jakarta', subtitle: 'Periode 2022-2026', screen: 'ArahDasar', icon: 'arrow-forward' },
  { id: 2, title: 'Dewan Paroki Harian', subtitle: 'Struktur organisasi paroki', screen: 'DewanParoki', icon: 'arrow-forward' },
  { id: 3, title: 'Filosofi Logo', subtitle: 'Makna/logo paroki', screen: 'FilosofiLogo', icon: 'arrow-forward' },
  { id: 4, title: 'Profil Imam', subtitle: 'Profil pastor paroki', screen: 'ProfilImam', icon: 'arrow-forward' },
  { id: 5, title: 'Santa Clara dari Assisi', subtitle: 'Sejarah santo pelindung', screen: 'SantaClaraAssisi', icon: 'arrow-forward' },
  { id: 6, title: 'Sejarah Gereja Santa Clara Bekasi', subtitle: 'Perjalanan gerejawi', screen: 'SejarahGereja', icon: 'arrow-forward' },
  { id: 7, title: 'Seksi', subtitle: 'Daftar seksi paroki', screen: 'Seksi', icon: 'arrow-forward' },
];

export const ProfileGerejaScreen: React.FC<ProfileGerejaScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a365d', colors.primary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Icon name="church" size={48} color={colors.white} />
          <Text style={styles.headerTitle}>Profile Gereja</Text>
          <Text style={styles.headerSubtitle}>Paroki Santa Clara Bekasi</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuItem}>
                <View style={styles.menuNumber}>
                  <Text style={styles.menuNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Icon name={item.icon} size={24} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuNumberText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
