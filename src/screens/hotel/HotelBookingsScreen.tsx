import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ErrorFeedback } from '../../components';
import { useErrorHandling } from '../../hooks/useErrorHandling';

const HotelBookingsScreen: React.FC = () => {
  const { error, clearError } = useErrorHandling();

  return (
    <View style={styles.container}>
      {/* Error Feedback */}
      {error && (
        <ErrorFeedback
          message={error.message}
          type={error.type}
          onDismiss={clearError}
        />
      )}
      
      <Text style={styles.title}>Hotel Bookings</Text>
      <Text style={styles.subtitle}>View and manage room bookings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212121',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default HotelBookingsScreen;