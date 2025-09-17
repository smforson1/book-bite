import { Alert } from 'react-native';
import { apiService } from '../services/apiService';

export const ensureAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await apiService.getAuthToken();
    if (!token) {
      Alert.alert(
        'Authentication Required',
        'Please log in to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    Alert.alert(
      'Authentication Error',
      'Please log in again to continue.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

export const quickLogin = async (): Promise<boolean> => {
  try {
    // Try to login with test credentials
    const response = await apiService.login('hotel@bookbite.com', 'password123');
    if (response.success) {
      Alert.alert('Success', 'Logged in successfully!');
      return true;
    } else {
      Alert.alert('Login Failed', response.error || 'Failed to login');
      return false;
    }
  } catch (error) {
    console.error('Quick login error:', error);
    Alert.alert('Login Error', 'Failed to login automatically');
    return false;
  }
};