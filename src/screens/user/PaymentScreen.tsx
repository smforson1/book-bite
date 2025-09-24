// Payment screen for BookBite Ghana - Handles mobile money, Paystack, and PalmPay

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { Button, Input, Card } from '../../components';

// Services
import { apiService } from '../../services/apiService';

// Hooks
import { usePayment } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';

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

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoadingMethods(false);
    }
  };

  const handlePromoApplication = async () => {
    const validationData = {
      userId: user?.id || 'current-user',
      paymentMethod: selectedMethod || (paymentType === 'mobile_money' ? 'mtn_momo' : 'paystack'),
      city: 'Accra', // You can get this from location service
      region: 'Greater Accra',
      userOrderCount: 0, // Replace with actual count
    };

    await handleApplyPromo(validationData);
  };

  const processPayment = async () => {
    if (isProcessing || processingPayment) return;

    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to continue');
      return;
    }

    // Validation for additional fields if needed
    if (paymentType === 'mobile_money' && phoneNumber && !phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid Ghana mobile number');
      return;
    }

    try {
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
            Alert.alert('Error', 'Cannot open payment URL');
          }
        } else {
          // For mobile money payments, show success and verify
          Alert.alert(
            'Payment Initiated',
            'Please complete the payment on your mobile money account',
            [
              {
                text: 'Verify Payment',
                onPress: () => verifyPayment(payment.transactionId)
              }
            ]
          );
        }
      } else {
        Alert.alert('Error', response.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const verifyPayment = async (transactionId: string) => {
    try {
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
        Alert.alert('Payment Failed', 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      Alert.alert('Error', 'Failed to verify payment');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <TouchableOpacity style={styles.applyPromoButton} onPress={handlePromoApplication}>
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
          onPress={processPayment}
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
});

export default PaymentScreen;