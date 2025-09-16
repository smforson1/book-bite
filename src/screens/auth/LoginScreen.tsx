import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Button, 
  Input, 
  Container, 
  LoadingState 
} from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ConnectionTest } from '../../components/ConnectionTest';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  const [showConnectionTest, setShowConnectionTest] = useState(false);

  const showDemoCredentials = () => {
    Alert.alert(
      'Demo Credentials',
      'Try these demo accounts:\n\n' +
      '🔐 Admin: admin@bookbite.com\n' +
      '🏨 Hotel Owner: hotel@bookbite.com\n' +
      '🍕 Restaurant Owner: restaurant@bookbite.com\n' +
      '👤 User: user@bookbite.com\n\n' +
      'Password: password123'
    );
  };

  return (
    <Container 
      safeArea
      variant="default"
      backgroundColor={theme.colors.background.secondary}
    >
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LoadingState loading={loading}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={48} color={theme.colors.primary[500]} />
            </View>
            <Text style={[globalStyles.h1, styles.title]}>BookBite</Text>
            <Text style={[globalStyles.bodyLarge, styles.subtitle]}>Welcome back! Sign in to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
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
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.tertiary} />}
              />
            </View>

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />

            <Button
              title="View Demo Credentials"
              variant="outline"
              onPress={showDemoCredentials}
              fullWidth
              style={styles.demoButton}
              icon={<Ionicons name="information-circle-outline" size={16} color={theme.colors.primary[500]} />}
            />

            <Button
              title="🔗 Test Backend Connection"
              variant="outline"
              onPress={() => setShowConnectionTest(true)}
              fullWidth
              style={{ marginTop: 8 }}
              icon={<Ionicons name="server-outline" size={16} color={theme.colors.primary[500]} />}
            />
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={[globalStyles.body, styles.footerText]}>Don't have an account?</Text>
            <Button
              title="Sign Up"
              variant="ghost"
              size="small"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Register');
              }}
              style={styles.signUpButton}
            />
          </View>
        </LoadingState>
      </KeyboardAvoidingView>
      
      {showConnectionTest && (
        <ConnectionTest onClose={() => setShowConnectionTest(false)} />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'] || 48,
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  
  title: {
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.md,
  },
  
  formSection: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  loginButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  
  demoButton: {
    marginBottom: 0,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
  },
  
  footerText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  signUpButton: {
    marginLeft: theme.spacing.sm,
  },
});

export default LoginScreen;