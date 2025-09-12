import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { HotelProvider } from './src/contexts/HotelContext';
import { RestaurantProvider } from './src/contexts/RestaurantContext';
import { ReviewProvider } from './src/contexts/ReviewContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeMockData } from './src/services/mockDataService';

export default function App() {
  useEffect(() => {
    // Initialize mock data on app startup
    initializeMockData();
  }, []);

  return (
    <AuthProvider>
      <HotelProvider>
        <RestaurantProvider>
          <ReviewProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ReviewProvider>
        </RestaurantProvider>
      </HotelProvider>
    </AuthProvider>
  );
}
