import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import HotelNavigator from './HotelNavigator';
import RestaurantNavigator from './RestaurantNavigator';
import { RootStackParamList } from '../types';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading, hasSeenOnboarding, completeOnboarding } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const getNavigatorForRole = () => {
    if (!user) return <AuthNavigator />;

    switch (user.role) {
      case 'admin':
        return <AdminNavigator />;
      case 'hotel_owner':
        return <HotelNavigator />;
      case 'restaurant_owner':
        return <RestaurantNavigator />;
      case 'user':
      default:
        return <UserNavigator />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={completeOnboarding} />}
          </Stack.Screen>
        ) : !user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main">
            {() => getNavigatorForRole()}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;