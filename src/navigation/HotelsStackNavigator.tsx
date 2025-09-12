import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '../styles/theme';
import HotelsScreen from '../screens/user/HotelsScreen';
import HotelDetailScreen from '../screens/user/HotelDetailScreen';
import PaymentScreen from '../screens/user/PaymentScreen';
import PaymentConfirmationScreen from '../screens/user/PaymentConfirmationScreen';

export type HotelsStackParamList = {
  HotelsList: undefined;
  HotelDetail: {
    hotel: any;
  };
  Payment: {
    amount: number;
    currency: string;
    paymentFor: 'booking' | 'order';
    referenceId: string;
  };
  PaymentConfirmation: {
    amount: number;
    currency: string;
    paymentFor: 'booking' | 'order';
    referenceId: string;
    paymentMethod: string;
    transactionId: string;
  };
};

const Stack = createStackNavigator<HotelsStackParamList>();

const HotelsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary[500],
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.neutral[0],
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semiBold,
          fontSize: theme.typography.fontSize.lg,
        },
      }}
    >
      <Stack.Screen 
        name="HotelsList" 
        component={HotelsScreen}
        options={{ 
          title: 'Hotels',
          headerShown: false // Tab navigator already shows header
        }}
      />
      <Stack.Screen 
        name="HotelDetail" 
        component={HotelDetailScreen}
        options={{ 
          title: 'Hotel Details',
          headerShown: false // Detail screen has custom header
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: 'Payment',
          headerShown: true // Show header for payment screen
        }}
      />
      <Stack.Screen
        name="PaymentConfirmation"
        component={PaymentConfirmationScreen}
        options={{
          title: 'Payment Confirmation',
          headerShown: true // Show header for payment confirmation
        }}
      />
    </Stack.Navigator>
  );
};

export default HotelsStackNavigator;