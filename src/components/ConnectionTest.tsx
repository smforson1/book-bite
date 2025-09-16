import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { apiService } from '../services/apiService';
import { theme } from '../styles/theme';

interface ConnectionTestProps {
  onClose: () => void;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'testing' | 'connected' | 'disconnected'>('testing');
  const [backendInfo, setBackendInfo] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('testing');
      
      // Test the health endpoint
      const response = await fetch('http://localhost:3000/health');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus('connected');
        setBackendInfo(data);
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus('disconnected');
    }
  };

  const testRegistration = async () => {
    try {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@bookbite.com`,
        password: 'Password123',
        role: 'user' as const,
        phone: '+233241234567'
      };

      const response = await apiService.register(testUser, testUser.password);
      
      if (response.success) {
        Alert.alert(
          'Registration Test Successful! 🎉',
          `User created: ${response.data?.user.name}\nEmail: ${response.data?.user.email}\nToken received: ${response.data?.token ? 'Yes' : 'No'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Registration Test Failed', response.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Registration Test Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return theme.colors.success[500];
      case 'disconnected': return theme.colors.error[500];
      default: return theme.colors.warning[500];
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '✅ Connected to Backend';
      case 'disconnected': return '❌ Backend Not Available';
      default: return '🔄 Testing Connection...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Text style={styles.title}>Backend Connection Test</Text>
        
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {backendInfo && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Backend Info:</Text>
            <Text style={styles.infoText}>Environment: {backendInfo.environment}</Text>
            <Text style={styles.infoText}>Version: {backendInfo.version}</Text>
            <Text style={styles.infoText}>Time: {new Date(backendInfo.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.buttonText}>🔄 Test Connection</Text>
          </TouchableOpacity>
          
          {status === 'connected' && (
            <TouchableOpacity style={styles.testButton} onPress={testRegistration}>
              <Text style={styles.buttonText}>👤 Test Registration</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.text.primary,
  },
  statusContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: theme.colors.background.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text.primary,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 10,
  },
  testButton: {
    backgroundColor: theme.colors.primary[500],
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: theme.colors.text.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
});