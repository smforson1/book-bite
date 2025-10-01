import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Components
import { Button, Card, GhanaCulturalElement, ErrorFeedback } from '../../components';
import { globalStyles } from '../../styles/globalStyles';
import { theme } from '../../styles/theme';

// Services
import { useAuth } from '../../contexts/AuthContext';
import { useHotel } from '../../contexts/HotelContext';
import { useErrorHandling } from '../../hooks/useErrorHandling';

// Navigation types
import { HotelsStackParamList } from '../../navigation/HotelsStackNavigator';

type BookingDetailsRouteProp = RouteProp<HotelsStackParamList, 'BookingDetail'>;
type BookingDetailsNavigationProp = StackNavigationProp<HotelsStackParamList, 'BookingDetail'>;

interface Props {
  navigation: BookingDetailsNavigationProp;
  route: BookingDetailsRouteProp;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BookingDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const { user } = useAuth();
  const { bookings, hotels, getHotelById } = useHotel();
  const [booking, setBooking] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const { error, clearError, withErrorHandling, showUserFeedback } = useErrorHandling();

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

  const handleCancelBooking = withErrorHandling(
    async () => {
      // In a real app, this would call an API to cancel the booking
      showUserFeedback('Your booking has been cancelled successfully. Refund will be processed according to the hotel\'s cancellation policy.', 'success');
    },
    {
      errorMessage: 'Failed to cancel booking. Please try again.',
      successMessage: 'Booking cancelled successfully',
      showSuccessToast: true,
      showErrorToast: true
    }
  );

  const handleContactHotel = withErrorHandling(
    async () => {
      if (hotel && hotel.phone) {
        try {
          await Linking.openURL(`tel:${hotel.phone}`);
          showUserFeedback('Calling hotel...', 'info');
        } catch (error) {
          showUserFeedback('Failed to make call. Please try again.', 'error');
          throw error;
        }
      } else {
        showUserFeedback('Hotel contact information is not available.', 'warning');
      }
    },
    {
      errorMessage: 'Failed to contact hotel. Please try again.',
      successMessage: 'Contacting hotel...',
      showSuccessToast: false,
      showErrorToast: true
    }
  );

  const handleDirections = withErrorHandling(
    async () => {
      if (hotel && hotel.location) {
        const { coordinates } = hotel.location;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`;
        try {
          await Linking.openURL(url);
          showUserFeedback('Opening directions in maps...', 'info');
        } catch (error) {
          showUserFeedback('Failed to open directions. Please try again.', 'error');
          throw error;
        }
      } else {
        showUserFeedback('Hotel location information is not available.', 'warning');
      }
    },
    {
      errorMessage: 'Failed to open directions. Please try again.',
      successMessage: 'Opening directions...',
      showSuccessToast: false,
      showErrorToast: true
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success[500];
      case 'pending':
        return theme.colors.warning[500];
      case 'completed':
        return theme.colors.info[500];
      case 'cancelled':
        return theme.colors.error[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return `${theme.colors.success[500]}20`;
      case 'pending':
        return `${theme.colors.warning[500]}20`;
      case 'completed':
        return `${theme.colors.info[500]}20`;
      case 'cancelled':
        return `${theme.colors.error[500]}20`;
      default:
        return `${theme.colors.neutral[500]}20`;
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

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!booking || !hotel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={globalStyles.body}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut);

  return (
    <SafeAreaView style={styles.container}>
      {/* Error Feedback */}
      {error && (
        <ErrorFeedback
          message={error.message}
          type={error.type}
          onDismiss={clearError}
        />
      )}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[globalStyles.h4, styles.headerTitle]}>Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Booking Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(booking.status) }]}>
            <Text style={[globalStyles.h5, styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Ghana cultural element */}
        <View style={styles.culturalElementContainer}>
          <GhanaCulturalElement type="kente-border" />
        </View>

        {/* Hotel Info */}
        <Card style={styles.hotelCard}>
          <View style={styles.hotelHeader}>
            {hotel.images && hotel.images.length > 0 ? (
              <View style={styles.hotelImage}>
                <Ionicons name="bed" size={32} color={theme.colors.text.primary} />
              </View>
            ) : (
              <View style={styles.hotelImagePlaceholder}>
                <Ionicons name="bed" size={32} color={theme.colors.text.tertiary} />
              </View>
            )}
            <View style={styles.hotelInfo}>
              <Text style={[globalStyles.h3, styles.hotelName]} numberOfLines={1}>{hotel.name}</Text>
              <View style={styles.hotelLocation}>
                <Ionicons name="location" size={16} color={theme.colors.text.tertiary} />
                <Text style={[globalStyles.bodySmall, styles.hotelAddress]} numberOfLines={1}>
                  {hotel.address}
                </Text>
              </View>
              <View style={styles.hotelRating}>
                <Ionicons name="star" size={16} color={theme.colors.warning[500]} />
                <Text style={[globalStyles.bodySmall, styles.ratingText]}>
                  {hotel.rating ? hotel.rating.toFixed(1) : 'New'} • {hotel.city}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.hotelActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleContactHotel}>
              <Ionicons name="call" size={20} color={theme.colors.primary[500]} />
              <Text style={[globalStyles.bodySmall, styles.actionText]}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
              <Ionicons name="navigate" size={20} color={theme.colors.primary[500]} />
              <Text style={[globalStyles.bodySmall, styles.actionText]}>Directions</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Booking Details */}
        <Card style={styles.detailsCard}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Booking Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={[globalStyles.body, styles.detailLabel]}>Booking ID:</Text>
            <Text style={[globalStyles.body, styles.detailValue]}>{booking.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[globalStyles.body, styles.detailLabel]}>Check-in:</Text>
            <View>
              <Text style={[globalStyles.body, styles.detailValue]}>{formatDate(booking.checkIn)}</Text>
              <Text style={[globalStyles.caption, styles.detailSubValue]}>After {formatTime(booking.checkIn)}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[globalStyles.body, styles.detailLabel]}>Check-out:</Text>
            <View>
              <Text style={[globalStyles.body, styles.detailValue]}>{formatDate(booking.checkOut)}</Text>
              <Text style={[globalStyles.caption, styles.detailSubValue]}>Before {formatTime(booking.checkOut)}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[globalStyles.body, styles.detailLabel]}>Duration:</Text>
            <Text style={[globalStyles.body, styles.detailValue]}>{nights} {nights === 1 ? 'Night' : 'Nights'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[globalStyles.body, styles.detailLabel]}>Guests:</Text>
            <Text style={[globalStyles.body, styles.detailValue]}>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[globalStyles.body, styles.detailLabel]}>Rooms:</Text>
            <Text style={[globalStyles.body, styles.detailValue]}>{booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'}</Text>
          </View>
        </Card>

        {/* Room Details */}
        <Card style={styles.roomCard}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Room Information</Text>
          
          <View style={styles.roomInfo}>
            <Text style={[globalStyles.h3, styles.roomType]}>{booking.roomType || 'Standard Room'}</Text>
            <Text style={[globalStyles.body, styles.roomDescription]}>
              {booking.roomDescription || 'Comfortable room with all essential amenities'}
            </Text>
          </View>
          
          <View style={styles.roomAmenities}>
            <Text style={[globalStyles.h5, styles.amenitiesTitle]}>Included Amenities:</Text>
            <View style={styles.amenitiesList}>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                <Text style={[globalStyles.body, styles.amenityText]}>Free WiFi</Text>
              </View>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                <Text style={[globalStyles.body, styles.amenityText]}>Air Conditioning</Text>
              </View>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                <Text style={[globalStyles.body, styles.amenityText]}>Television</Text>
              </View>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                <Text style={[globalStyles.body, styles.amenityText]}>Room Service</Text>
              </View>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                <Text style={[globalStyles.body, styles.amenityText]}>Breakfast Included</Text>
              </View>
              <View style={styles.amenityItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
                <Text style={[globalStyles.body, styles.amenityText]}>Private Bathroom</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Payment Details */}
        <Card style={styles.paymentCard}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Payment Summary</Text>
          
          <View style={styles.paymentRow}>
            <Text style={[globalStyles.body, styles.paymentLabel]}>Room Charges:</Text>
            <Text style={[globalStyles.body, styles.paymentValue]}>₵{(booking.totalPrice - 15).toFixed(2)}</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={[globalStyles.body, styles.paymentLabel]}>Service Fee:</Text>
            <Text style={[globalStyles.body, styles.paymentValue]}>₵15.00</Text>
          </View>
          
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={[globalStyles.h3, styles.totalLabel]}>Total Paid:</Text>
            <Text style={[globalStyles.h3, styles.totalValue]}>₵{booking.totalPrice.toFixed(2)}</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={[globalStyles.body, styles.paymentLabel]}>Payment Status:</Text>
            <Text style={[
              globalStyles.body,
              styles.paymentStatus,
              { color: booking.paymentStatus === 'paid' ? theme.colors.success[500] : theme.colors.warning[500] }
            ]}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={[globalStyles.body, styles.paymentLabel]}>Payment Method:</Text>
            <Text style={[globalStyles.body, styles.paymentValue]}>Mobile Money</Text>
          </View>
        </Card>

        {/* Booking Policies */}
        <Card style={styles.policyCard}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Booking Policies</Text>
          
          <View style={styles.policyItem}>
            <Ionicons name="information-circle" size={16} color={theme.colors.primary[500]} />
            <Text style={[globalStyles.bodySmall, styles.policyText]}>
              Free cancellation up to 24 hours before check-in
            </Text>
          </View>
          
          <View style={styles.policyItem}>
            <Ionicons name="information-circle" size={16} color={theme.colors.primary[500]} />
            <Text style={[globalStyles.bodySmall, styles.policyText]}>
              Check-in time is from 2:00 PM
            </Text>
          </View>
          
          <View style={styles.policyItem}>
            <Ionicons name="information-circle" size={16} color={theme.colors.primary[500]} />
            <Text style={[globalStyles.bodySmall, styles.policyText]}>
              Check-out time is by 12:00 PM
            </Text>
          </View>
        </Card>

        {/* Contact Hotel */}
        <Card style={styles.contactCard}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Need Help?</Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactHotel}>
            <Ionicons name="call" size={20} color={theme.colors.primary[500]} />
            <Text style={[globalStyles.body, styles.contactButtonText]}>Contact Hotel</Text>
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
    backgroundColor: theme.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing[2],
  },
  headerTitle: {
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing[4],
  },
  statusBadge: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  culturalElementContainer: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  hotelCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  hotelHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing[4],
  },
  hotelImage: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  hotelImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  hotelInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  hotelName: {
    marginBottom: theme.spacing[1],
    color: theme.colors.text.primary,
  },
  hotelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
  },
  hotelAddress: {
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[1],
  },
  hotelRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[1],
  },
  hotelActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionText: {
    color: theme.colors.primary[500],
    marginLeft: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  detailsCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    marginBottom: theme.spacing[4],
    color: theme.colors.text.primary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  detailLabel: {
    color: theme.colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    textAlign: 'right',
    flex: 1,
  },
  detailSubValue: {
    color: theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: theme.spacing[1],
  },
  roomCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  roomInfo: {
    marginBottom: theme.spacing[4],
  },
  roomType: {
    marginBottom: theme.spacing[2],
    color: theme.colors.text.primary,
  },
  roomDescription: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  roomAmenities: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing[4],
  },
  amenitiesTitle: {
    marginBottom: theme.spacing[3],
    color: theme.colors.text.primary,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: theme.spacing[2],
  },
  amenityText: {
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[2],
  },
  paymentCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  paymentLabel: {
    color: theme.colors.text.secondary,
  },
  paymentValue: {
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing[3],
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  totalLabel: {
    color: theme.colors.text.primary,
  },
  totalValue: {
    color: theme.colors.text.primary,
  },
  paymentStatus: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  policyCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  policyText: {
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[2],
    flex: 1,
  },
  contactCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: `${theme.colors.primary[500]}10`,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  contactButtonText: {
    color: theme.colors.primary[500],
    marginLeft: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  buttonContainer: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  cancelButton: {
    borderColor: theme.colors.error[500],
  },
});

export default BookingDetailsScreen;
