import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { HotelProvider } from './src/contexts/HotelContext';
import { RestaurantProvider } from './src/contexts/RestaurantContext';
import { ReviewProvider } from './src/contexts/ReviewContext';

import AppNavigator from './src/navigation/AppNavigator';
import { initializeMockData } from './src/services/mockDataService';
import { ErrorBoundary, OfflineIndicator } from './src/components/ErrorBoundary';
import { errorHandlingService } from './src/services/errorHandlingService';
import { ghanaAnalyticsService } from './src/services/ghanaAnalyticsService';
import OfflineStatusIndicator from './src/components/OfflineStatusIndicator';
import OfflineCapabilitiesIndicator from './src/components/OfflineCapabilitiesIndicator';

export default function App() {
  useEffect(() => {
    // Initialize app services
    const initializeApp = async () => {
      try {
        // Initialize mock data only in development mode
        if (__DEV__) {
          await initializeMockData();
        }
        
        // Track app startup
        await ghanaAnalyticsService.trackEvent({
          type: 'user_action',
          data: {
            action: 'app_startup',
            timestamp: new Date().toISOString(),
            platform: 'mobile'
          }
        });
        
        console.log('BookBite Ghana app initialized successfully');
      } catch (error) {
        // Log initialization error
        await errorHandlingService.logError({
          type: 'unknown',
          severity: 'high',
          message: `App initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          context: {
            action: 'app_initialization'
          },
          userImpact: 'severe'
        });
        
        console.error('Failed to initialize BookBite app:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log React errors
        errorHandlingService.logError({
          type: 'ui',
          severity: 'critical',
          message: `React Error Boundary: ${error.message}`,
          stack: error.stack,
          context: {
            action: 'react_error_boundary',
            screen: 'app_root'
          },
          userImpact: 'severe'
        });
      }}
    >
      <AuthProvider>
        <HotelProvider>
          <RestaurantProvider>
            <ReviewProvider>
              <OfflineStatusIndicator />
              <OfflineCapabilitiesIndicator />
              <AppNavigator />
              <OfflineIndicator />
              <StatusBar style="auto" />
            </ReviewProvider>
          </RestaurantProvider>
        </HotelProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}