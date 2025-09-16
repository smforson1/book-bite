import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, ReviewSummary } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useHotel } from '../../contexts/HotelContext';
import { useAuth } from '../../contexts/AuthContext';
import { useReview } from '../../contexts/ReviewContext';
import { Hotel, Room } from '../../types';

const { width } = Dimensions.get('window');

interface HotelDetailScreenProps {
  route: {
    params: {
      hotel: Hotel;
    };
  };
  navigation: any;
}

const HotelDetailScreen: React.FC<HotelDetailScreenProps> = ({ route, navigation }) => {
  const { hotel } = route.params;
  const { user } = useAuth();
  const { getRoomsByHotelId, createBooking } = useHotel();
  const { getReviewSummary, canUserReview } = useReview();
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [guests, setGuests] = useState(1);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const rooms = useMemo(() => getRoomsByHotelId(hotel.id), [hotel.id]);
  const reviewSummary = useMemo(() => getReviewSummary(hotel.id, 'hotel'), [hotel.id]);
  const canWriteReview = user ? canUserReview(user.id, hotel.id, 'hotel') : false;
  
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  const handleDateChange = (event: any, selectedDate?: Date, type: 'checkIn' | 'checkOut' = 'checkIn') => {
    const currentDate = selectedDate || (type === 'checkIn' ? checkInDate : checkOutDate);
    
    if (type === 'checkIn') {
      setShowCheckInPicker(false);
      if (currentDate >= new Date()) {
        setCheckInDate(currentDate);
        // Auto-adjust checkout if it's before new check-in
        if (currentDate >= checkOutDate) {
          setCheckOutDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
        }
      }
    } else {
      setShowCheckOutPicker(false);
      if (currentDate > checkInDate) {
        setCheckOutDate(currentDate);
      }
    }
  };

  const handleAddToBookingCart = async () => {
    if (!selectedRoom || !user) {
      Alert.alert('Error', 'Please select a room and ensure you are logged in.');
      return;
    }

    try {
      setIsBooking(true);
      
      // Create a pending booking (like adding to cart)
      const bookingData = {
        userId: user.id,
        roomId: selectedRoom.id,
        hotelId: hotel.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: 'pending' as const, // Pending status like cart
        paymentStatus: 'pending' as const,
        specialRequests: ''
      };

      await createBooking(bookingData);

      Alert.alert(
        'Added to Booking Cart! 🛒',
        `${selectedRoom.name} at ${hotel.name} has been added to your booking cart. Complete your booking in the Bookings tab.`,
        [
          {
            text: 'Continue Browsing',
            style: 'cancel'
          },
          {
            text: 'Go to Bookings',
            onPress: () => navigation.navigate('Bookings'),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add booking to cart. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // This function will be called after successful payment
  const handlePaymentSuccess = async (paymentMethod: string, transactionId: string) => {
    if (!selectedRoom || !user) {
      Alert.alert('Error', 'Missing required information for booking.');
      return;
    }
    
    try {
      await createBooking({
        userId: user.id,
        roomId: selectedRoom.id,
        hotelId: hotel.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod,
        transactionId,
        paymentDate: new Date(),
      });

      Alert.alert(
        'Booking Confirmed!',
        `Your booking at ${hotel.name} has been confirmed. You will receive a confirmation email shortly.`,
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('Bookings'),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  // This function will be called if payment fails
  const handlePaymentFailure = () => {
    Alert.alert(
      'Payment Failed',
      'Your payment could not be processed. Would you like to try again?',
      [
        { text: 'Cancel', onPress: () => navigation.goBack() },
        { text: 'Try Again', onPress: handleAddToBookingCart }
      ]
    );
  };

  const handleWriteReview = () => {
    // @ts-ignore - Navigation will be properly typed in actual navigation setup
    navigation.navigate('WriteReview', {
      targetId: hotel.id,
      targetType: 'hotel',
      targetName: hotel.name,
    });
  };

  const handleSeeAllReviews = () => {
    // @ts-ignore - Navigation will be properly typed in actual navigation setup
    navigation.navigate('ReviewsList', {
      targetId: hotel.id,
      targetType: 'hotel',
      targetName: hotel.name,
    });
  };

  const renderAmenity = (amenity: string, index: number) => (
    <View key={index} style={styles.amenityItem}>
      <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
      <Text style={styles.amenityText}>{amenity}</Text>
    </View>
  );

  const renderRoom = (room: Room, index: number) => (
    <TouchableOpacity
      key={room.id}
      style={[
        styles.roomCard,
        selectedRoom?.id === room.id && styles.selectedRoomCard
      ]}
      onPress={() => setSelectedRoom(room)}
    >
      <Image source={{ uri: room.images[0] }} style={styles.roomImage} />
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomDescription}>{room.description}</Text>
        <Text style={styles.roomCapacity}>Max Guests: {room.capacity}</Text>
        <View style={styles.roomPricing}>
          <Text style={styles.roomPrice}>${room.price}</Text>
          <Text style={styles.roomPriceUnit}>/ night</Text>
        </View>
        <View style={styles.roomAmenities}>
          {room.amenities.slice(0, 3).map((amenity, idx) => (
            <Text key={idx} style={styles.roomAmenityTag}>
              {amenity}
            </Text>
          ))}
        </View>
      </View>
      {selectedRoom?.id === room.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary[500]} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hotel Images */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: hotel.images[0] }} style={styles.heroImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.neutral[0]} />
          </TouchableOpacity>
        </View>

        {/* Hotel Info */}
        <View style={styles.hotelInfo}>
          <Text style={[globalStyles.h1, styles.hotelName]}>{hotel.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={theme.colors.warning[500]} />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
            <Text style={styles.address}>{hotel.address}</Text>
          </View>
          <Text style={[globalStyles.bodyLarge, styles.description]}>{hotel.description}</Text>
        </View>

        {/* Amenities */}
        <Card style={styles.section}>
          <Text style={[globalStyles.h3, styles.sectionTitle]}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {hotel.amenities.map(renderAmenity)}
          </View>
        </Card>

        {/* Reviews Section */}
        <ReviewSummary
          summary={reviewSummary}
          canWriteReview={canWriteReview}
          onWriteReviewPress={handleWriteReview}
          onSeeAllReviewsPress={handleSeeAllReviews}
        />

        {/* Booking Section */}
        <Card style={styles.section}>
          <Text style={[globalStyles.h3, styles.sectionTitle]}>Book Your Stay</Text>
          
          {/* Date Selection */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{checkInDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{checkOutDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {/* Guest Selection */}
          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>Guests</Text>
            <View style={styles.guestControls}>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests(Math.max(1, guests - 1))}
              >
                <Ionicons name="remove" size={20} color={theme.colors.primary[500]} />
              </TouchableOpacity>
              <Text style={styles.guestCount}>{guests}</Text>
              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => setGuests(Math.min(8, guests + 1))}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Room Selection */}
        <Card style={styles.section}>
          <Text style={[globalStyles.h3, styles.sectionTitle]}>Available Rooms</Text>
          {rooms.filter(room => room.isAvailable && room.capacity >= guests).map(renderRoom)}
          {rooms.filter(room => room.isAvailable && room.capacity >= guests).length === 0 && (
            <Text style={styles.noRoomsText}>
              No rooms available for {guests} guest{guests > 1 ? 's' : ''}
            </Text>
          )}
        </Card>

        {/* Booking Summary */}
        {selectedRoom && (
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Room:</Text>
              <Text style={styles.summaryValue}>{selectedRoom.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dates:</Text>
              <Text style={styles.summaryValue}>
                {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nights:</Text>
              <Text style={styles.summaryValue}>{nights}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Guests:</Text>
              <Text style={styles.summaryValue}>{guests}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>GH₵{totalPrice.toFixed(2)}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Booking Bar */}
      {selectedRoom && (
        <View style={styles.bottomBar}>
          <View style={styles.priceInfo}>
            <Text style={styles.bottomPrice}>GH₵{totalPrice.toFixed(2)}</Text>
            <Text style={styles.bottomPriceUnit}>for {nights} night{nights > 1 ? 's' : ''}</Text>
          </View>
          <Button
            title={isBooking ? "Adding..." : "Add to Booking Cart 🛒"}
            onPress={handleAddToBookingCart}
            disabled={isBooking}
            style={styles.bookButton}
          />
        </View>
      )}

      {/* Date Pickers */}
      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'checkIn')}
          minimumDate={new Date()}
        />
      )}
      
      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'checkOut')}
          minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotelInfo: {
    padding: theme.spacing.lg,
  },
  hotelName: {
    marginBottom: theme.spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  ratingText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  address: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  description: {
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  section: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    width: '45%',
  },
  amenityText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  dateButton: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  dateLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  dateValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  guestLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCount: {
    marginHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRoomCard: {
    borderColor: theme.colors.primary[500],
  },
  roomImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  roomInfo: {
    flex: 1,
    padding: theme.spacing.md,
  },
  roomName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  roomDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  roomCapacity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  roomPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  roomPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary[500],
  },
  roomPriceUnit: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  roomAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roomAmenityTag: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  noRoomsText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    padding: theme.spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary[500],
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    ...theme.shadows.md,
  },
  priceInfo: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary[500],
  },
  bottomPriceUnit: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  bookButton: {
    minWidth: 120,
  },
});

export default HotelDetailScreen;