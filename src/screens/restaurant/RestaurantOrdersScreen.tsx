import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RestaurantOrdersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Orders</Text>
      <Text style={styles.subtitle}>View and manage incoming orders</Text>
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

export default RestaurantOrdersScreen;