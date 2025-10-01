import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card, ErrorFeedback } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useErrorHandling } from '../../hooks/useErrorHandling';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1); // 1 for personal info, 2 for business info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'hotel_owner' | 'restaurant_owner'>('user');
  const [managerId, setManagerId] = useState(''); // Special ID for managers
  
  // Business information (step 2)
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  
  const { error, clearError, withErrorHandling, showUserFeedback } = useErrorHandling();

  const validateManagerId = (id: string, userRole: string): boolean => {
    // These would be the special IDs you provide to managers
    const validManagerIds = {
      hotel_owner: ['HTL001', 'HTL002', 'HTL003', 'HTL004', 'HTL005'],
      restaurant_owner: ['RST001', 'RST002', 'RST003', 'RST004', 'RST005']
    };
    
    if (userRole === 'hotel_owner') {
      return validManagerIds.hotel_owner.includes(id);
    } else if (userRole === 'restaurant_owner') {
      return validManagerIds.restaurant_owner.includes(id);
    }
    return true; // Users don't need ID validation
  };

  const handleNextStep = withErrorHandling(
    async () => {
      // Validate step 1
      if (!name || !email || !password || !confirmPassword || !phone) {
        showUserFeedback('Please fill in all required fields', 'warning');
        throw new Error('Missing fields');
      }

      if (password !== confirmPassword) {
        showUserFeedback('Passwords do not match', 'warning');
        throw new Error('Password mismatch');
      }

      if (password.length < 6) {
        showUserFeedback('Password must be at least 6 characters', 'warning');
        throw new Error('Password too short');
      }

      // Validate manager ID for business accounts
      if ((role === 'hotel_owner' || role === 'restaurant_owner')) {
        if (!managerId) {
          showUserFeedback('Please enter your Manager ID', 'warning');
          throw new Error('Missing Manager ID');
        }
        if (!validateManagerId(managerId, role)) {
          showUserFeedback('Invalid Manager ID. Please contact support for a valid ID.', 'error');
          throw new Error('Invalid Manager ID');
        }
      }

      // For users, register directly. For managers, go to step 2
      if (role === 'user') {
        await handleRegister();
      } else {
        setStep(2);
      }
    },
    {
      errorMessage: 'Failed to proceed to next step. Please check your information and try again.',
      showErrorToast: false // We're handling errors with showUserFeedback
    }
  );

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleRegister = withErrorHandling(
    async () => {
      // Validate business info for step 2
      if (step === 2 && (role === 'hotel_owner' || role === 'restaurant_owner')) {
        if (!businessName || !businessAddress || !businessDescription) {
          showUserFeedback('Please fill in all business information fields', 'warning');
          throw new Error('Missing business information');
        }
      }

      const userData = {
        name,
        email,
        phone,
        role,
        managerId: (role !== 'user') ? managerId : undefined,
        businessInfo: (role !== 'user') ? {
          name: businessName,
          address: businessAddress,
          description: businessDescription,
          phone: businessPhone
        } : undefined
      };
      
      const success = await register(userData, password);

      if (!success) {
        throw new Error('Registration failed. Please try again.');
      }
      
      showUserFeedback('Registration successful!', 'success');
    },
    {
      errorMessage: 'Registration failed. Please try again.',
      successMessage: 'Registration successful!',
      showSuccessToast: true,
      showErrorToast: true
    }
  );

  const { register } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {error && (
          <ErrorFeedback
            message={error.message}
            type={error.type}
            onDismiss={clearError}
          />
        )}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={40} color={theme.colors.primary[500]} />
            </View>
            <Text style={[globalStyles.h2, styles.title]}>
              {step === 1 ? 'Create Account' : `Setup Your ${role === 'hotel_owner' ? 'Hotel' : 'Restaurant'}`}
            </Text>
            <Text style={[globalStyles.bodyLarge, styles.subtitle]}>
              {step === 1 ? 'Join BookBite today and start your journey' : 'Tell us about your business'}
            </Text>
            {step === 2 && (
              <Text style={[globalStyles.bodySmall, styles.stepIndicator]}>Step 2 of 2</Text>
            )}
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
              {step === 1 ? (
                // Step 1: Personal Information
                <>
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
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="Customer" value="user" />
                        <Picker.Item label="Hotel Owner" value="hotel_owner" />
                        <Picker.Item label="Restaurant Owner" value="restaurant_owner" />
                      </Picker>
                    </View>
                  </View>

                  {(role === 'hotel_owner' || role === 'restaurant_owner') && (
                    <Input
                      label="Manager ID"
                      placeholder={`Enter your ${role === 'hotel_owner' ? 'Hotel' : 'Restaurant'} Manager ID`}
                      value={managerId}
                      onChangeText={setManagerId}
                      autoCapitalize="characters"
                      leftIcon={<Ionicons name="card-outline" size={20} color={theme.colors.text.tertiary} />}
                    />
                  )}

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
                    title={step === 1 && (role === 'user') ? 'Create Account' : 'Next'}
                    onPress={() => handleNextStep()}
                    fullWidth
                    style={styles.registerButton}
                  />
                </>
              ) : (
                // Step 2: Business Information
                <>
                  <Input
                    label={`${role === 'hotel_owner' ? 'Hotel' : 'Restaurant'} Name`}
                    placeholder={`Enter your ${role === 'hotel_owner' ? 'hotel' : 'restaurant'} name`}
                    value={businessName}
                    onChangeText={setBusinessName}
                    autoCapitalize="words"
                    leftIcon={<Ionicons name={role === 'hotel_owner' ? 'business-outline' : 'restaurant-outline'} size={20} color={theme.colors.text.tertiary} />}
                  />

                  <Input
                    label="Business Address"
                    placeholder="Enter your business address"
                    value={businessAddress}
                    onChangeText={setBusinessAddress}
                    multiline
                    numberOfLines={2}
                    leftIcon={<Ionicons name="location-outline" size={20} color={theme.colors.text.tertiary} />}
                  />

                  <Input
                    label="Business Description"
                    placeholder={`Describe your ${role === 'hotel_owner' ? 'hotel' : 'restaurant'}`}
                    value={businessDescription}
                    onChangeText={setBusinessDescription}
                    multiline
                    numberOfLines={3}
                    leftIcon={<Ionicons name="document-text-outline" size={20} color={theme.colors.text.tertiary} />}
                  />

                  <Input
                    label="Business Phone"
                    placeholder="Enter business phone number"
                    value={businessPhone}
                    onChangeText={setBusinessPhone}
                    keyboardType="phone-pad"
                    leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.text.tertiary} />}
                  />

                  <View style={styles.buttonRow}>
                    <Button
                      title="Back"
                      variant="outline"
                      onPress={handlePreviousStep}
                      style={styles.backButton}
                    />
                    <Button
                      title="Create Account"
                      onPress={() => handleRegister()}
                      style={styles.registerButton}
                    />
                  </View>
                </>
              )}
            </View>
          </Card>

          <View style={styles.footer}>
            <Text style={[globalStyles.body, styles.footerText]}>Already have an account?</Text>
            <Button
              title="Sign In"
              variant="ghost"
              size="small"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Login');
              }}
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
  
  stepIndicator: {
    textAlign: 'center',
    color: theme.colors.primary[500],
    marginTop: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.medium,
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
    color: theme.colors.text.primary,
  },
  
  pickerItem: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
  
  backButton: {
    flex: 1,
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