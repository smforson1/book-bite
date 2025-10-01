// Payment screen for BookBite Ghana - Handles mobile money, Paystack, and PalmPay

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { Button, Input, Card, ErrorFeedback } from '../../components';

// Services
import { apiService } from '../../services/apiService';
import { paymentService } from '../../services/paymentService';

// Hooks
import { usePayment } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorHandling } from '../../hooks/useErrorHandling';

// Navigation types
import { RestaurantsStackParamList } from '../../navigation/RestaurantsStackNavigator';
import { HotelsStackParamList } from '../../navigation/HotelsStackNavigator';

// Combined navigation type for screens that can be accessed from both stacks
type CombinedStackParamList = RestaurantsStackParamList & HotelsStackParamList;

type PaymentScreenRouteProp = RouteProp<CombinedStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = StackNavigationProp<CombinedStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, currency, paymentFor, referenceId } = route.params;
  const { user } = useAuth();
  const { error, clearError, withErrorHandling, showUserFeedback } = useErrorHandling();
  const {
    isProcessing,
    promoCode,
    setPromoCode,
    appliedPromo,
    discountAmount,
    finalAmount,
    handleApplyPromo,
    removePromo,
  } = usePayment({ amount, currency, paymentFor, referenceId });

  // Payment methods from backend
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Payment state
  const [paymentType, setPaymentType] = useState<'mobile_money' | 'card'>('mobile_money');

  // Mobile money state
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Card payment state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Ghana-specific mobile money instructions
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = withErrorHandling(
    async () => {
      setLoadingMethods(true);
      const response = await apiService.getPaymentMethods();

      if (response.success && response.data?.paymentMethods) {
        const activeMethods = response.data.paymentMethods.filter(method => method.isActive);
        setPaymentMethods(activeMethods);

        // Auto-select first available method
        if (activeMethods.length > 0) {
          setSelectedMethod(activeMethods[0].id);
          // Set payment type based on first method
          if (activeMethods[0].type === 'card') {
            setPaymentType('card');
          } else {
            setPaymentType('mobile_money');
          }
        }
      } else {
        showUserFeedback('Failed to load payment methods', 'error');
      }
    },
    {
      errorMessage: 'Failed to load payment methods. Please try again.',
      showErrorToast: false
    }
  );

  const handlePromoApplication = withErrorHandling(
    async () => {
      const validationData = {
        userId: user?.id || 'current-user',
        paymentMethod: selectedMethod || (paymentType === 'mobile_money' ? 'mtn_momo' : 'paystack'),
        city: 'Accra', // You can get this from location service
        region: 'Greater Accra',
        userOrderCount: 0, // Replace with actual count
      };

      await handleApplyPromo(validationData);
    },
    {
      errorMessage: 'Failed to apply promo code. Please try again.',
      showErrorToast: false
    }
  );

  const processPayment = withErrorHandling(
    async () => {
      if (isProcessing || processingPayment) return;

      if (!selectedMethod) {
        showUserFeedback('Please select a payment method', 'warning');
        return;
      }

      if (!user) {
        showUserFeedback('Please log in to continue', 'warning');
        return;
      }

      // Validation for mobile money
      if (paymentType === 'mobile_money') {
        if (!phoneNumber.trim()) {
          showUserFeedback('Please enter your phone number', 'warning');
          return;
        }

        // Use the static method to validate phone number (since isValidGhanaianPhoneNumber is private)
        const phoneRegex = /^(\+233|0)(20|21|23|24|25|26|27|28|29|50|53|54|55|56|57|59)\d{7}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
          showUserFeedback('Please enter a valid Ghanaian phone number', 'warning');
          return;
        }
      }

      // Validation for card payments
      if (paymentType === 'card') {
        if (!cardNumber.trim() || !expiryMonth.trim() || !expiryYear.trim() || !cvv.trim() || !cardholderName.trim()) {
          showUserFeedback('Please fill in all card details', 'warning');
          return;
        }
      }

      setProcessingPayment(true);

      const paymentData = {
        amount: finalAmount,
        currency: currency || 'GHS',
        paymentMethod: selectedMethod,
        referenceId,
        type: paymentFor
      };

      const response = await apiService.initiatePayment(paymentData);

      if (response.success && response.data) {
        const { payment, paymentUrl, accessCode } = response.data;

        if (paymentUrl) {
          // For web-based payments (like Paystack), open in browser
          const supported = await Linking.canOpenURL(paymentUrl);

          if (supported) {
            await Linking.openURL(paymentUrl);

            // Navigate to payment verification screen
            navigation.navigate('PaymentVerification', {
              transactionId: payment.transactionId,
              amount: finalAmount,
              paymentFor,
              referenceId
            });
          } else {
            showUserFeedback('Cannot open payment URL', 'error');
          }
        } else {
          // For mobile money payments, show success and verify
          showUserFeedback('Please complete the payment on your mobile money account', 'info');
          // Navigate to payment verification screen
          navigation.navigate('PaymentVerification', {
            transactionId: payment.transactionId,
            amount: finalAmount,
            paymentFor,
            referenceId
          });
        }
      } else {
        showUserFeedback(response.message || 'Payment initiation failed', 'error');
      }
    },
    {
      errorMessage: 'Payment failed. Please try again.',
      showErrorToast: false
    }
  );

  const verifyPayment = withErrorHandling(
    async (transactionId: string) => {
      const response = await apiService.verifyPayment(transactionId);

      if (response.success) {
        // Navigate to confirmation screen with payment details
        navigation.navigate('PaymentConfirmation', {
          amount: finalAmount,
          currency: currency || 'GHS',
          paymentFor,
          referenceId,
          paymentMethod: selectedMethod,
          transactionId
        });
      } else {
        showUserFeedback('Payment verification failed. Please contact support.', 'error');
      }
    },
    {
      errorMessage: 'Failed to verify payment. Please try again.',
      showErrorToast: false
    }
  );

  // Render mobile money instructions
  const renderMobileMoneyInstructions = () => {
    if (!showInstructions) return null;

    // Use helper functions to get instructions and tips since static methods aren't accessible
    const getNetworkInstructions = (network: string): string => {
      switch (network) {
        case 'MTN':
          return '1. You will receive a prompt on your MTN phone\n2. Enter your Mobile Money PIN to confirm\n3. Wait for confirmation SMS';
        case 'Vodafone':
          return '1. You will receive a prompt on your Vodafone phone\n2. Enter your Vodafone Cash PIN to confirm\n3. Wait for confirmation SMS';
        case 'AirtelTigo':
          return '1. You will receive a prompt on your AirtelTigo phone\n2. Enter your AirtelTigo Money PIN to confirm\n3. Wait for confirmation SMS';
        default:
          return '1. Follow the prompts on your device\n2. Enter your PIN to confirm payment\n3. Wait for confirmation';
      }
    };

    const getNetworkTips = (network: string): string[] => {
      switch (network) {
        case 'MTN':
          return [
            'Ensure you have sufficient balance in your MTN Mobile Money account',
            'Keep your PIN secure and never share it with anyone',
            'MTN Mobile Money transactions are limited to GHS 5,000 per day'
          ];
        case 'Vodafone':
          return [
            'Ensure you have sufficient balance in your Vodafone Cash account',
            'Keep your PIN secure and never share it with anyone',
            'Vodafone Cash transactions may take up to 2 minutes to process'
          ];
        case 'AirtelTigo':
          return [
            'Ensure you have sufficient balance in your AirtelTigo Money account',
            'Keep your PIN secure and never share it with anyone',
            'AirtelTigo Money transactions are available 24/7'
          ];
        default:
          return [
            'Ensure you have sufficient funds in your account',
            'Keep your PIN secure and never share it with anyone',
            'Contact support if you do not receive a confirmation within 5 minutes'
          ];
      }
    };

    const instructions = getNetworkInstructions(selectedNetwork);
    const tips = getNetworkTips(selectedNetwork);

    return (
      <Card style={styles.instructionsCard}>
        <View style={styles.instructionsHeader}>
          <Text style={styles.instructionsTitle}>Payment Instructions</Text>
          <TouchableOpacity onPress={() => setShowInstructions(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.instructionsText}>{instructions}</Text>
        
        <Text style={styles.tipsTitle}>Tips:</Text>
        {tips.map((tip: string, index: number) => (
          <View key={index} style={styles.tipRow}>
            <Ionicons name="information-circle" size={16} color="#007AFF" style={styles.tipIcon} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <ErrorFeedback
          message={error.message}
          type={error.type}
          onDismiss={clearError}
        />
      )}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Complete Payment</Text>

        {/* Payment Method Selection */}
        {loadingMethods ? (
          <Card style={styles.sectionCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading payment methods...</Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    selectedMethod === method.id && styles.selectedPaymentMethod
                  ]}
                  onPress={() => {
                    setSelectedMethod(method.id);
                    setPaymentType(method.type === 'card' ? 'card' : 'mobile_money');
                  }}
                >
                  <View style={styles.paymentMethodContent}>
                    <View style={styles.paymentMethodLeft}>
                      <View style={[
                        styles.paymentMethodIcon,
                        selectedMethod === method.id && styles.selectedPaymentMethodIcon
                      ]}>
                        <Ionicons
                          name={method.icon === 'card' ? 'card' : 'phone-portrait'}
                          size={24}
                          color={selectedMethod === method.id ? '#007AFF' : '#666'}
                        />
                      </View>
                      <View style={styles.paymentMethodInfo}>
                        <Text style={[
                          styles.paymentMethodName,
                          selectedMethod === method.id && styles.selectedPaymentMethodText
                        ]}>
                          {method.name}
                        </Text>
                        <Text style={styles.paymentMethodDescription}>
                          {method.description}
                        </Text>
                      </View>
                    </View>
                    <View style={[
                      styles.radioButton,
                      selectedMethod === method.id && styles.selectedRadioButton
                    ]}>
                      {selectedMethod === method.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noMethodsContainer}>
                <Ionicons name="card-outline" size={48} color="#ccc" />
                <Text style={styles.noMethodsTitle}>No Payment Methods Available</Text>
                <Text style={styles.noMethodsText}>
                  Please contact support to set up payment methods.
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Mobile Money Form */}
        {paymentType === 'mobile_money' && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Mobile Money Details</Text>

            <Text style={styles.label}>Network</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedNetwork}
                onValueChange={setSelectedNetwork}
                style={styles.picker}
              >
                <Picker.Item label="MTN Mobile Money" value="MTN" />
                <Picker.Item label="Vodafone Cash" value="Vodafone" />
                <Picker.Item label="AirtelTigo Money" value="AirtelTigo" />
              </Picker>
            </View>

            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="0XX XXX XXXX"
              maxLength={15}
            />

            <TouchableOpacity 
              style={styles.instructionsButton}
              onPress={() => setShowInstructions(!showInstructions)}
            >
              <Text style={styles.instructionsButtonText}>
                {showInstructions ? 'Hide Instructions' : 'Show Payment Instructions'}
              </Text>
              <Ionicons 
                name={showInstructions ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>

            {renderMobileMoneyInstructions()}
          </Card>
        )}

        {/* Card Form */}
        {paymentType === 'card' && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Card Details</Text>

            <Input
              label="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Input
                  label="Expiry Month"
                  value={expiryMonth}
                  onChangeText={setExpiryMonth}
                  keyboardType="numeric"
                  placeholder="MM"
                  maxLength={2}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Expiry Year"
                  value={expiryYear}
                  onChangeText={setExpiryYear}
                  keyboardType="numeric"
                  placeholder="YY"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Input
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  placeholder="123"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Cardholder Name"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                />
              </View>
            </View>
          </Card>
        )}

        {/* Promotions Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Promotions & Discounts</Text>

          {!appliedPromo && (
            <View style={styles.promoRow}>
              <Input
                label="Promo Code"
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                style={styles.promoInput}
              />
              <TouchableOpacity style={styles.applyPromoButton} onPress={() => handlePromoApplication()}>
                <Text style={styles.applyPromoText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}

          {appliedPromo && (
            <View style={styles.appliedPromoContainer}>
              <View style={styles.appliedPromoInfo}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <View style={styles.appliedPromoText}>
                  <Text style={styles.appliedPromoTitle}>{appliedPromo.title}</Text>
                  <Text style={styles.appliedPromoSavings}>You save ₵{discountAmount.toFixed(2)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={removePromo}>
                <Ionicons name="close-circle" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Payment Summary */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount:</Text>
            <Text style={styles.summaryValue}>₵{amount.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>-₵{discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₵{finalAmount.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Pay Button */}
        <Button
          title={processingPayment ? 'Processing...' : `Pay ₵${finalAmount.toFixed(2)}`}
          onPress={() => processPayment()}
          disabled={isProcessing || processingPayment || !selectedMethod}
          style={styles.payButton}
          loading={processingPayment}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paymentTypeButton: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedPaymentType: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  paymentTypeText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  selectedPaymentTypeText: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  validationContainer: {
    marginTop: 8,
  },
  validationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  validationError: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  validationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
  },
  validationErrorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#F44336',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  promoInput: {
    flex: 1,
    marginRight: 12,
  },
  applyPromoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyPromoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedPromoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedPromoText: {
    marginLeft: 12,
    flex: 1,
  },
  appliedPromoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  appliedPromoSavings: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  payButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedPaymentMethodIcon: {
    backgroundColor: '#E3F2FD',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  selectedPaymentMethodText: {
    color: '#007AFF',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: '#007AFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  noMethodsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noMethodsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noMethodsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  instructionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  instructionsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  instructionsCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
});

export default PaymentScreen;