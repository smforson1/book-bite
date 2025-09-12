import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HotelsStackParamList } from '../../navigation/HotelsStackNavigator';
import { RestaurantsStackParamList } from '../../navigation/RestaurantsStackNavigator';

// Types for our payment system
interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  lastFour: string;
  expirationDate: string;
  isDefault: boolean;
}

interface PaymentProps {
  amount: number;
  currency: string;
  paymentFor: 'booking' | 'order';
  referenceId: string;
}

type PaymentScreenRouteProp = RouteProp<HotelsStackParamList | RestaurantsStackParamList, 'Payment'>;
type PaymentScreenNavigationProp = StackNavigationProp<HotelsStackParamList | RestaurantsStackParamList, 'Payment'>;

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  
  // Get route params
  const { amount: routeAmount, currency: routeCurrency, paymentFor: routePaymentFor, referenceId: routeReferenceId } = route.params;
  
  // Payment state
  const [amount, setAmount] = useState(routeAmount);
  const [currency, setCurrency] = useState(routeCurrency);
  const [paymentFor, setPaymentFor] = useState<'booking' | 'order'>(routePaymentFor);
  const [referenceId, setReferenceId] = useState(routeReferenceId);
  
  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(true);
  
  // Simulated saved payment methods
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit_card',
      lastFour: '4242',
      expirationDate: '12/28',
      isDefault: true,
    },
    {
      id: '2',
      type: 'paypal',
      lastFour: '1234',
      expirationDate: '',
      isDefault: false,
    }
  ]);
  
  // Handle payment submission
  const handlePayment = () => {
    // Simulate payment processing
    Alert.alert(
      'Processing Payment',
      `Processing payment of $${amount.toFixed(2)} for ${paymentFor === 'booking' ? 'hotel booking' : 'restaurant order'}...`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Payment cancelled')
        },
        {
          text: 'Confirm',
          onPress: () => simulatePaymentProcessing()
        }
      ],
      { cancelable: false }
    );
  };
  
  // Simulate payment processing
  const simulatePaymentProcessing = () => {
    // Simulate API call with timeout
    setTimeout(() => {
      // Simulate random success/failure
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        // Navigate to confirmation screen
        navigation.navigate('PaymentConfirmation', {
          amount,
          currency,
          paymentFor,
          referenceId,
          paymentMethod: selectedPaymentMethod || 'new_card',
          transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        });
      } else {
        Alert.alert(
          'Payment Failed',
          'Your payment could not be processed. Please try again with a different payment method.',
          [{ text: 'OK' }]
        );
      }
    }, 1500);
  };
  
  // Render saved payment methods
  const renderSavedPaymentMethods = () => {
    return (
      <View style={styles.savedMethodsContainer}>
        <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === method.id && styles.selectedPaymentMethod
            ]}
            onPress={() => {
              setSelectedPaymentMethod(method.id);
              setUseNewCard(false);
            }}
          >
            <View style={styles.paymentMethodLeft}>
              <Ionicons 
                name={
                  method.type === 'credit_card' ? 'card-outline' : 
                  method.type === 'paypal' ? 'logo-paypal' :
                  method.type === 'apple_pay' ? 'logo-apple' :
                  method.type === 'debit_card' ? 'card-outline' :
                  'cash-outline'
                } 
                size={24} 
                color={theme.colors.primary[500]}
              />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodType}>
                  {method.type === 'credit_card' ? 'Credit Card' : 
                   method.type === 'debit_card' ? 'Debit Card' : 
                   method.type === 'paypal' ? 'PayPal' : 
                   method.type === 'apple_pay' ? 'Apple Pay' : 
                   'Other'}
                </Text>
                <Text style={styles.paymentMethodLastFour}>
                  {method.type === 'paypal' ? '****' + method.lastFour : '**** ' + method.lastFour}
                </Text>
              </View>
            </View>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addNewCardButton}
          onPress={() => setUseNewCard(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary[500]} />
          <Text style={styles.addNewCardText}>Add New Payment Method</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render new payment method form
  const renderNewPaymentForm = () => {
    return (
      <View style={styles.newPaymentForm}>
        <Text style={styles.sectionTitle}>New Payment Method</Text>
        <Input
          label="Card Number"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
          maxLength={19}
        />
        <View style={styles.rowContainer}>
          <View style={styles.halfInput}>
            <Input
              label="Expiration Date"
              value={expirationDate}
              onChangeText={(text) => {
                // Format as MM/YY
                if (text.length <= 5) {
                  if (text.length === 2 && !text.includes('/')) {
                    setExpirationDate(text + '/');
                  } else {
                    setExpirationDate(text);
                  }
                }
              }}
              keyboardType="numeric"
              maxLength={5}
              placeholder="MM/YY"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="CVV"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
        <Input
          label="Cardholder Name"
          value={cardholderName}
          onChangeText={setCardholderName}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} /> {/* Spacer to balance header */}
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.amountCard}>
          <View style={styles.amountHeader}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.currencyLabel}>{currency}</Text>
          </View>
          <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
          <Text style={styles.paymentForText}>For {paymentFor === 'booking' ? 'Hotel Booking' : 'Restaurant Order'}</Text>
        </Card>
        
        {renderSavedPaymentMethods()}
        
        {useNewCard && renderNewPaymentForm()}
        
        <Button 
          title="Pay Now" 
          onPress={handlePayment} 
          style={styles.payButton}
          loading={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  amountCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  amountLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  currencyLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  amountValue: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  paymentForText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  savedMethodsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedPaymentMethod: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    marginLeft: theme.spacing.md,
  },
  paymentMethodType: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  paymentMethodLastFour: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  defaultBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.full,  },
  defaultBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
  },
  addNewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  addNewCardText: {
    marginLeft: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
  },
  newPaymentForm: {
    marginBottom: theme.spacing.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  payButton: {
    marginTop: theme.spacing.lg,
  },
});