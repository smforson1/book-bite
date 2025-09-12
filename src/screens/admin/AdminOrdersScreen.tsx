import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminOrdersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Orders</Text>
      <Text style={styles.subtitle}>Monitor and manage food orders</Text>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default AdminOrdersScreen;