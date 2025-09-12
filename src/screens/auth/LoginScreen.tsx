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
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen: React.FC = () => {
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
              <Ionicons name="restaurant" size={48} color={theme.colors.primary[500]} />
            </View>
            <Text style={[globalStyles.h1, styles.title]}>BookBite</Text>
            <Text style={[globalStyles.bodyLarge, styles.subtitle]}>Welcome back! Sign in to continue</Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
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
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.tertiary} />}
              />

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
            </View>
          </Card>

          <View style={styles.footer}>
            <Text style={[globalStyles.body, styles.footerText]}>Don't have an account?</Text>
            <Button
              title="Sign Up"
              variant="ghost"
              size="small"
              onPress={() => {}}
              style={styles.signUpButton}
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[8],
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  
  loginButton: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  
  demoButton: {
    marginBottom: theme.spacing[2],
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
  
  signUpButton: {
    marginLeft: theme.spacing[1],
  },
});

export default LoginScreen;