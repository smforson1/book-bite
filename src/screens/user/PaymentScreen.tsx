// Payment screen for BookBite Ghana - Handles mobile money, Paystack, and PalmPay

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { Button, Input, Card } from '../../components';

// Hooks
import { usePayment } from '../../hooks';

// Types
type RootStackParamList = {
  Payment: {
    amount: number;
    currency: string;
    paymentFor: 'booking' | 'order';
    referenceId: string;
    promoCode?: string;
    originalAmount?: number;
    discountAmount?: number;
    city?: string;
    region?: string;
  };
};

type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, currency, paymentFor, referenceId } = route.params;
  const {
    isProcessing,
    promoCode,
    setPromoCode,
    appliedPromo,
    discountAmount,
    finalAmount,
    handleApplyPromo,
    removePromo,
    handlePayment,
  } = usePayment({ amount, currency, paymentFor, referenceId });
  
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

  const handlePromoApplication = async () => {
    const validationData = {
      userId: 'current-user', // Replace with actual user ID
      paymentMethod: paymentType === 'mobile_money' ? 'mobile_money' : 'paystack',
      city: 'Accra', // You can get this from location service
      region: 'Greater Accra',
      userOrderCount: 0, // Replace with actual count
    };
    
    await handleApplyPromo(validationData);
  };

  const processPayment = async () => {
    if (isProcessing) return;

    // Validation
    if (paymentType === 'mobile_money') {
      if (!phoneNumber) {
        Alert.alert('Error', 'Please enter a valid Ghana mobile number');
        return;
      }
    } else {
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    }

    try {
      let paymentDetails;
      
      if (paymentType === 'mobile_money') {
        paymentDetails = {
          paymentMethodId: 'momo_' + selectedNetwork.toLowerCase(),
          mobileMoneyData: {
            phoneNumber,
            network: selectedNetwork as any,
          },
        };
      } else {
        paymentDetails = {
          paymentMethodId: 'paystack_card',
          cardData: {
            number: cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            holderName: cardholderName,
          },
        };
      }

      const result = await handlePayment(paymentType, paymentDetails);

      Alert.alert('Payment Successful', `Your payment of ₵${finalAmount.toFixed(2)} has been processed.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      Alert.alert('Payment Failed', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Complete Payment</Text>

        {/* Payment Type Selection */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentTypeContainer}>
            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                paymentType === 'mobile_money' && styles.selectedPaymentType,
              ]}
              onPress={() => setPaymentType('mobile_money')}
            >
              <Ionicons name="phone-portrait" size={24} color={paymentType === 'mobile_money' ? '#fff' : '#666'} />
              <Text style={[
                styles.paymentTypeText,
                paymentType === 'mobile_money' && styles.selectedPaymentTypeText,
              ]}>
                Mobile Money
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                paymentType === 'card' && styles.selectedPaymentType,
              ]}
              onPress={() => setPaymentType('card')}
            >
              <Ionicons name="card" size={24} color={paymentType === 'card' ? '#fff' : '#666'} />
              <Text style={[
                styles.paymentTypeText,
                paymentType === 'card' && styles.selectedPaymentTypeText,
              ]}>
                Card
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

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
          title={isProcessing ? 'Processing...' : `Pay ₵${finalAmount.toFixed(2)}`}
          onPress={processPayment}
          disabled={isProcessing}
          style={styles.payButton}
          loading={isProcessing}
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
});

export default PaymentScreen;