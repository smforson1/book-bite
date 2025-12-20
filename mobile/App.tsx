import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { PaystackProvider } from 'react-native-paystack-webview';
import AppNavigator from './src/navigation/AppNavigator';
import { usePushNotifications } from './src/hooks/usePushNotifications';

export default function App() {
  usePushNotifications(); // Initialize notifications

  return (
    <PaperProvider>
      <PaystackProvider publicKey="pk_test_ef987dc54d0c766b2cd6fc9c4fc10b794f94b99b">
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaystackProvider>
    </PaperProvider>
  );
}
