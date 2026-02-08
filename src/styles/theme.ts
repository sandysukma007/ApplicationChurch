import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#A85603',
  secondary: '#C67C3E',
  background: '#F8F6F4',
  text: '#2C3E50',
  textSecondary: '#666666',
  white: '#FFFFFF',
  error: '#E74C3C',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #A85603 0%, #C67C3E 100%)',
  header: 'linear-gradient(90deg, #A85603 0%, #E39A5C 100%)',
};

export const theme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginVertical: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
