import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '../../components';
import { apiService } from '../../services/apiService';
import { RestaurantsStackParamList } from '../../navigation/RestaurantsStackNavigator';
import { HotelsStackParamList } from '../../navigation/HotelsStackNavigator';

// Combined navigation type for screens that can be accessed from both stacks
type CombinedStackParamList = RestaurantsStackParamList & HotelsStackParamList;

type PaymentVerificationScreenRouteProp = RouteProp<CombinedStackParamList, 'PaymentVerification'>;
type PaymentVerificationScreenNavigationProp = StackNavigationProp<CombinedStackParamList, 'PaymentVerification'>;

const PaymentVerificationScreen: React.FC = () => {
  const navigation = useNavigation<PaymentVerificationScreenNavigationProp>();
  const route = useRoute<PaymentVerificationScreenRouteProp>();
  const params = route.params;

  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      const response = await apiService.verifyPayment(params.transactionId);

      if (response.success) {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      verifyPayment();
    } else {
      Alert.alert(
        'Verification Failed',
        'Unable to verify payment after multiple attempts. Please contact support.',
        [
          {
            text: 'Contact Support',
            onPress: () => {
              Alert.alert('Support', 'Please contact support at support@bookbite.com');
            }
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handleContinue = () => {
    if (paymentStatus === 'success') {
      // Navigate to confirmation screen with payment details
      navigation.navigate('PaymentConfirmation', {
        amount: params.amount,
        currency: 'GHS',
        paymentFor: params.paymentFor,
        referenceId: params.referenceId,
        paymentMethod: 'verified_payment', // We don't have the original method here
        transactionId: params.transactionId
      });
    } else {
      navigation.goBack();
    }
  };

  const renderContent = () => {
    if (verifying) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.verifyingTitle}>Verifying Payment...</Text>
          <Text style={styles.verifyingSubtitle}>
            Please wait while we confirm your payment
          </Text>
        </View>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Payment Successful! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your payment of GH₵{params.amount.toFixed(2)} has been processed successfully
          </Text>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionId}>{params.transactionId}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.centerContent}>
        <View style={styles.failedIcon}>
          <Ionicons name="close-circle" size={80} color="#F44336" />
        </View>
        <Text style={styles.failedTitle}>Payment Verification Failed</Text>
        <Text style={styles.failedSubtitle}>
          We couldn't verify your payment. This might be due to network issues or the payment is still processing.
        </Text>
        <View style={styles.retryInfo}>
          <Text style={styles.retryText}>
            Retry attempts: {retryCount}/3
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Verification</Text>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.footer}>
        {verifying ? null : paymentStatus === 'success' ? (
          <Button
            title="Continue"
            onPress={handleContinue}
            style={styles.successButton}
          />
        ) : (
          <View style={styles.failedActions}>
            <Button
              title="Retry Verification"
              onPress={handleRetry}
              disabled={retryCount >= 3}
              style={styles.retryButton}
            />
            <Button
              title="Go Back"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  centerContent: {
    alignItems: 'center',
  },
  verifyingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  verifyingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  transactionInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B5E20',
    fontFamily: 'monospace',
  },
  failedIcon: {
    marginBottom: 16,
  },
  failedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  failedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  retryInfo: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  retryText: {
    fontSize: 14,
    color: '#E65100',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  failedActions: {
    gap: 12,
  },
  retryButton: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  backButton: {
    backgroundColor: '#666',
  },
});

export default PaymentVerificationScreen;