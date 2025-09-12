import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HotelRoomsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Rooms</Text>
      <Text style={styles.subtitle}>Add, edit, and manage your hotel rooms</Text>
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

export default HotelRoomsScreen;