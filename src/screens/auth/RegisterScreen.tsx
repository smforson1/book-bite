import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'hotel_owner' | 'restaurant_owner'>('user');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const success = await register({
      name,
      email,
      phone,
      role,
    }, password);
    setLoading(false);

    if (!success) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={40} color={theme.colors.primary[500]} />
            </View>
            <Text style={[globalStyles.h2, styles.title]}>Create Account</Text>
            <Text style={[globalStyles.bodyLarge, styles.subtitle]}>Join BookBite today and start your journey</Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.text.tertiary} />}
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.tertiary} />}
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.text.tertiary} />}
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Account Type</Text>
                <View style={styles.pickerWrapper}>
                  <Ionicons name="briefcase-outline" size={20} color={theme.colors.text.tertiary} style={styles.pickerIcon} />
                  <Picker
                    selectedValue={role}
                    style={styles.picker}
                    onValueChange={(value) => setRole(value)}
                  >
                    <Picker.Item label="Customer" value="user" />
                    <Picker.Item label="Hotel Owner" value="hotel_owner" />
                    <Picker.Item label="Restaurant Owner" value="restaurant_owner" />
                  </Picker>
                </View>
              </View>

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.tertiary} />}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.text.tertiary} />}
              />

              <Button
                title={loading ? 'Creating Account...' : 'Create Account'}
                onPress={handleRegister}
                loading={loading}
                fullWidth
                style={styles.registerButton}
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Text style={[globalStyles.body, styles.footerText]}>Already have an account?</Text>
            <Button
              title="Sign In"
              variant="ghost"
              size="small"
              onPress={() => {}}
              style={styles.signInButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  content: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[6],
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
    ...theme.shadows.md,
  },
  
  title: {
    color: theme.colors.primary[500],
    marginBottom: theme.spacing[2],
  },
  
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  
  formCard: {
    marginBottom: theme.spacing[6],
  },
  
  form: {
    gap: theme.spacing[1],
  },
  
  pickerContainer: {
    marginBottom: theme.spacing[4],
  },
  
  pickerLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    paddingHorizontal: theme.spacing[4],
    minHeight: 44,
  },
  
  pickerIcon: {
    marginRight: theme.spacing[2],
  },
  
  picker: {
    flex: 1,
    height: 44,
  },
  
  registerButton: {
    marginTop: theme.spacing[2],
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[4],
  },
  
  footerText: {
    color: theme.colors.text.secondary,
  },
  
  signInButton: {
    marginLeft: theme.spacing[1],
  },
});

export default RegisterScreen;