import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { Button, Card, ErrorFeedback } from '../../components';

// Services
import { useAuth } from '../../contexts/AuthContext';
import { useErrorHandling } from '../../hooks/useErrorHandling';

// Navigation types
import { RestaurantsStackParamList } from '../../navigation/RestaurantsStackNavigator';
import { HotelsStackParamList } from '../../navigation/HotelsStackNavigator';

type PaymentConfirmationRouteProp = RouteProp<RestaurantsStackParamList & HotelsStackParamList, 'PaymentConfirmation'>;
type PaymentConfirmationNavigationProp = StackNavigationProp<RestaurantsStackParamList & HotelsStackParamList, 'PaymentConfirmation'>;

interface Props {
  navigation: PaymentConfirmationNavigationProp;
  route: PaymentConfirmationRouteProp;
}

const PaymentConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { amount, currency, paymentFor, referenceId, paymentMethod, transactionId } = route.params;
  const { user } = useAuth();
  const { error, clearError, withErrorHandling, showUserFeedback } = useErrorHandling();

  const handleGoHome = withErrorHandling(
    async () => {
      // Navigate back to the main user screen
      navigation.navigate('Restaurants' as any, { screen: 'RestaurantsList' });
      showUserFeedback('Navigating to home screen', 'info');
    },
    {
      errorMessage: 'Failed to navigate to home screen. Please try again.',
      successMessage: 'Navigating to home screen',
      showSuccessToast: false,
      showErrorToast: true
    }
  );

  const handleViewDetails = withErrorHandling(
    async () => {
      if (paymentFor === 'order') {
        navigation.navigate('Orders' as any);
      } else {
        navigation.navigate('Bookings' as any);
      }
      showUserFeedback('Navigating to details screen', 'info');
    },
    {
      errorMessage: 'Failed to navigate to details screen. Please try again.',
      successMessage: 'Navigating to details screen',
      showSuccessToast: false,
      showErrorToast: true
    }
  );

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'paystack':
        return 'card';
      case 'mtn_momo':
        return 'phone-portrait';
      case 'palmpay':
        return 'wallet';
      default:
        return 'card';
    }
  };

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case 'paystack':
        return 'Paystack (Card)';
      case 'mtn_momo':
        return 'MTN Mobile Money';
      case 'palmpay':
        return 'PalmPay';
      default:
        return 'Card Payment';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Error Feedback */}
      {error && (
        <ErrorFeedback
          message={error.message}
          type={error.type}
          onDismiss={clearError}
        />
      )}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Your payment has been processed successfully.
          </Text>
        </View>

        {/* Payment Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>₵{amount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <View style={styles.methodContainer}>
              <Ionicons 
                name={getPaymentMethodIcon()} 
                size={16} 
                color="#666" 
                style={styles.methodIcon}
              />
              <Text style={styles.detailValue}>{getPaymentMethodLabel()}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
              {transactionId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>For:</Text>
            <Text style={styles.detailValue}>
              {paymentFor === 'order' ? 'Restaurant Order' : 'Hotel Booking'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference:</Text>
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
              {referenceId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </Card>

        {/* User Info */}
        <Card style={styles.userCard}>
          <Text style={styles.sectionTitle}>Paid By</Text>
          <View style={styles.userRow}>
            <Ionicons name="person" size={20} color="#666" style={styles.userIcon} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
        </Card>

        {/* Next Steps */}
        <Card style={styles.stepsCard}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Payment Confirmed</Text>
              <Text style={styles.stepDescription}>
                Your payment has been successfully processed
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="time" size={20} color="#FF9800" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                {paymentFor === 'order' ? 'Order Processing' : 'Booking Confirmation'}
              </Text>
              <Text style={styles.stepDescription}>
                {paymentFor === 'order' 
                  ? 'Your order is being prepared' 
                  : 'Your booking is being confirmed'}
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="notifications" size={20} color="#2196F3" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Status Updates</Text>
              <Text style={styles.stepDescription}>
                You'll receive notifications about status changes
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="View Details"
          onPress={handleViewDetails}
          variant="outline"
          style={styles.detailsButton}
        />
        <Button
          title="Go to Home"
          onPress={handleGoHome}
          style={styles.homeButton}
        />
      </View>
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
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsCard: {
    margin: 16,
    padding: 16,
  },
  userCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  stepsCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  methodIcon: {
    marginRight: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  detailsButton: {
    flex: 1,
    marginRight: 8,
  },
  homeButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default PaymentConfirmationScreen;