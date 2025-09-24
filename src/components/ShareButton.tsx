import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useSocialShare } from '../hooks/useSocialShare';
import { Ionicons } from '@expo/vector-icons';

interface ShareButtonProps {
  type: 'booking' | 'order' | 'restaurant' | 'hotel';
  data: any;
  style?: object;
}

const ShareButton: React.FC<ShareButtonProps> = ({ type, data, style }) => {
  const { 
    shareBooking, 
    shareOrder, 
    shareRestaurant, 
    shareHotel 
  } = useSocialShare();

  const handleShare = async () => {
    try {
      let result = false;
      
      switch (type) {
        case 'booking':
          result = await shareBooking(data);
          break;
        case 'order':
          result = await shareOrder(data);
          break;
        case 'restaurant':
          result = await shareRestaurant(data);
          break;
        case 'hotel':
          result = await shareHotel(data);
          break;
        default:
          Alert.alert('Error', 'Invalid share type');
          return;
      }

      if (result) {
        Alert.alert('Success', 'Content shared successfully!');
      } else {
        Alert.alert('Error', 'Failed to share content');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share content');
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handleShare}>
      <Ionicons name="share-outline" size={20} color="#fff" />
      <Text style={styles.buttonText}>Share</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default ShareButton;