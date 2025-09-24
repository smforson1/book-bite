import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { Button, Card } from '../../components';

// Services
import { useAuth } from '../../contexts/AuthContext';
import { useHotel } from '../../contexts/HotelContext';

// Navigation types
import { HotelsStackParamList } from '../../navigation/HotelsStackNavigator';

type BookingDetailsRouteProp = RouteProp<HotelsStackParamList, 'BookingDetail'>;
type BookingDetailsNavigationProp = StackNavigationProp<HotelsStackParamList, 'BookingDetail'>;

interface Props {
  navigation: BookingDetailsNavigationProp;
  route: BookingDetailsRouteProp;
}

const BookingDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const { user } = useAuth();
  const { bookings, hotels, getHotelById } = useHotel();
  const [booking, setBooking] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);

  useEffect(() => {
    const foundBooking = bookings.find(b => b.id === bookingId);
    if (foundBooking) {
      setBooking(foundBooking);
      const foundHotel = getHotelById(foundBooking.hotelId);
      if (foundHotel) {
        setHotel(foundHotel);
      }
    }
  }, [bookingId, bookings, getHotelById]);

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Cancellation policies may apply.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to cancel the booking
            Alert.alert(
              'Booking Cancelled',
              'Your booking has been cancelled successfully. Refund will be processed according to the hotel\'s cancellation policy.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleContactHotel = () => {
    if (hotel && hotel.phone) {
      Linking.openURL(`tel:${hotel.phone}`);
    } else {
      Alert.alert('Contact Information', 'Hotel contact information is not available.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!booking || !hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Booking Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Hotel Info */}
        <Card style={styles.hotelCard}>
          <View style={styles.hotelHeader}>
            {hotel.image ? (
              <View style={styles.hotelImagePlaceholder}>
                <Ionicons name="bed" size={32} color="#666" />
              </View>
            ) : (
              <View style={styles.hotelImagePlaceholder}>
                <Ionicons name="bed" size={32} color="#666" />
              </View>
            )}
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <View style={styles.hotelLocation}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.hotelAddress}>{hotel.address}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Booking Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>{booking.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-in:</Text>
            <View>
              <Text style={styles.detailValue}>{formatDate(booking.checkIn)}</Text>
              <Text style={styles.detailSubValue}>After {formatTime(booking.checkIn)}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-out:</Text>
            <View>
              <Text style={styles.detailValue}>{formatDate(booking.checkOut)}</Text>
              <Text style={styles.detailSubValue}>Before {formatTime(booking.checkOut)}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Guests:</Text>
            <Text style={styles.detailValue}>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rooms:</Text>
            <Text style={styles.detailValue}>{booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'}</Text>
          </View>
        </Card>

        {/* Room Details */}
        <Card style={styles.roomCard}>
          <Text style={styles.sectionTitle}>Room Information</Text>
          
          <View style={styles.roomInfo}>
            <Text style={styles.roomType}>{booking.roomType || 'Standard Room'}</Text>
            <Text style={styles.roomDescription}>
              {booking.roomDescription || 'Comfortable room with all essential amenities'}
            </Text>
          </View>
          
          <View style={styles.roomAmenities}>
            <Text style={styles.amenitiesTitle}>Included Amenities:</Text>
            <View style={styles.amenitiesList}>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.amenityText}>Free WiFi</Text>
              </View>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.amenityText}>Air Conditioning</Text>
              </View>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.amenityText}>Television</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Payment Details */}
        <Card style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Room Charges:</Text>
            <Text style={styles.paymentValue}>₵{(booking.totalPrice - 15).toFixed(2)}</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Fee:</Text>
            <Text style={styles.paymentValue}>₵15.00</Text>
          </View>
          
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalValue}>₵{booking.totalPrice.toFixed(2)}</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status:</Text>
            <Text style={[
              styles.paymentStatus,
              { color: booking.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }
            ]}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Text>
          </View>
        </Card>

        {/* Contact Hotel */}
        <Card style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactHotel}>
            <Ionicons name="call" size={20} color="#2196F3" />
            <Text style={styles.contactButtonText}>Contact Hotel</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel Booking"
            onPress={handleCancelBooking}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hotelCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  hotelHeader: {
    flexDirection: 'row',
  },
  hotelImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  detailSubValue: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
    marginTop: 2,
  },
  roomCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  roomInfo: {
    marginBottom: 16,
  },
  roomType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  roomDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  roomAmenities: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  amenitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  paymentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: '#666',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  paymentStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    borderColor: '#F44336',
  },
});

export default BookingDetailsScreen;