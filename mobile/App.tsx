import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { PaystackProvider } from 'react-native-paystack-webview';
import AppNavigator from './src/navigation/AppNavigator';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { UserTheme } from './src/theme';
import { ThemeProvider } from './src/context/ThemeContext';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: UserTheme.primary,
    secondary: UserTheme.secondary,
    error: UserTheme.error,
  },
};

const NavigationWrapper = () => {
  usePushNotifications();
  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <PaperProvider theme={theme}>
        <NavigationWrapper />
      </PaperProvider>
    </ThemeProvider>
  );
}
