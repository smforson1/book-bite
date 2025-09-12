import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HotelsStackParamList } from '../../navigation/HotelsStackNavigator';
import { RestaurantsStackParamList } from '../../navigation/RestaurantsStackNavigator';

type PaymentConfirmationScreenRouteProp = RouteProp<HotelsStackParamList | RestaurantsStackParamList, 'PaymentConfirmation'>;
type PaymentConfirmationScreenNavigationProp = StackNavigationProp<HotelsStackParamList | RestaurantsStackParamList, 'PaymentConfirmation'>;

const PaymentConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<PaymentConfirmationScreenNavigationProp>();
  const route = useRoute<PaymentConfirmationScreenRouteProp>();
  
  const { 
    amount, 
    currency, 
    paymentFor, 
    referenceId, 
    paymentMethod, 
    transactionId 
  } = route.params;
  
  // Format date as MM/DD/YYYY
  const currentDate = new Date();
  const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
  
  // Navigate back to home or appropriate screen
  const handleDone = () => {
    // Navigate back to the previous screens by popping the stack
    navigation.popToTop();
  };
  
  // Print receipt
  const handlePrintReceipt = () => {
    Alert.alert(
      'Receipt Printed',
      'Your receipt has been successfully printed.',
      [{ text: 'OK' }]
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
        <Text style={styles.headerTitle}>Payment Confirmation</Text>
        <View style={{ width: 24 }} /> {/* Spacer to balance header */}
      </View>
      
      <View style={styles.content}>
        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeader}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.success[500]} />
            <Text style={styles.successText}>Payment Successful!</Text>
          </View>
          
          <View style={styles.receiptDetails}>
            <View style={styles.receiptRow}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{transactionId}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formattedDate}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.value}>{currency} ${amount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.label}>Payment For:</Text>
              <Text style={styles.value}>{paymentFor === 'booking' ? 'Hotel Booking' : 'Restaurant Order'}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.label}>Reference ID:</Text>
              <Text style={styles.value}>{referenceId}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.label}>Payment Method:</Text>
              <Text style={styles.value}>
                {paymentMethod === 'new_card' ? 'New Credit Card' : 'Saved Method'}
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Thank you for your payment. Your {paymentFor === 'booking' ? 'hotel booking' : 'restaurant order'} is now confirmed.
            </Text>
          </View>
        </View>
        
        <Button 
          title="Done" 
          onPress={handleDone} 
          style={styles.doneButton}
        />
        
        <TouchableOpacity 
          style={styles.printButton} 
          onPress={handlePrintReceipt}
        >
          <Ionicons name="print" size={20} color={theme.colors.primary[500]} />
          <Text style={styles.printButtonText}>Print Receipt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentConfirmationScreen;

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
  content: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  receiptContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  successText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  receiptDetails: {
    width: '100%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  footer: {
    paddingTop: theme.spacing.md,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  doneButton: {
    width: '100%',
    maxWidth: 400,
    marginBottom: theme.spacing.md,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  printButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
});