# TODO List for App Modernization

## 1. Create CustomAlert Component
- [x] Create src/components/CustomAlert.tsx with modern modal styling using react-native-modal, theme colors, gradients, shadows, and rounded corners.
- [x] Implement show method for displaying alerts with title, message, and type (success/error).

## 2. Update HomeScreen
- [x] Add icons to menu buttons using react-native-vector-icons.
- [x] Modernize styles: Use theme color #A85603, add gradients, shadows, cards.
- [x] Implement proper logout: Import logout from auth.ts, call on logout button press, navigate to Login.
- [x] Add back button confirmation: Use BackHandler to show confirmation dialog on back press.

## 3. Update RegisterScreen
- [x] Remove role selection UI (roleLabel, roleContainer, role buttons).
- [x] Remove role state variable.
- [x] Auto-set role to 'jemaat' in handleRegister data.

## 4. Replace Alert.alert in Screens
- [x] Update src/screens/VerifyCodeScreen.tsx: Replace 3 Alert.alert with CustomAlert.show.
- [x] Update src/screens/ResetPasswordScreen.tsx: Replace 2 Alert.alert with CustomAlert.show.
- [x] Update src/screens/RegisterScreen.tsx: Replace 2 Alert.alert with CustomAlert.show.
- [ ] Update src/screens/ProfileScreen.tsx: Replace 2 Alert.alert with CustomAlert.show.
- [ ] Update src/screens/MediaScreen.tsx: Replace 1 Alert.alert with CustomAlert.show.
- [ ] Update src/screens/LoginScreen.tsx: Replace 1 Alert.alert with CustomAlert.show.
- [ ] Update src/screens/ForgotPasswordScreen.tsx: Replace 2 Alert.alert with CustomAlert.show.
- [ ] Update src/screens/DonationsScreen.tsx: Replace 2 Alert.alert with CustomAlert.show.

## 5. Testing
- [ ] Run the app (npx react-native run-android or run-ios) to verify changes.
- [ ] Test modern UI, logout, back button, role auto-set, custom alerts.
