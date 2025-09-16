import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { theme } from '../../styles/theme';
import { useHotel } from '../../contexts/HotelContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Booking } from '../../types';

// Navigation type for tab navigation
type TabNavigationProp = {
  navigate: (screen: string, params?: any) => void;
  getParent: () => any;
};

const BookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const { bookings, getHotelById, getRoomsByHotelId, updateBookingStatus } = useHotel();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<TabNavigationProp>();

  useEffect(() => {
    if (user) {
      const filtered = bookings.filter(booking => booking.userId === user.id);
      setUserBookings(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, [bookings, user]);

  // Separate pending bookings (booking cart) from other bookings
  const pendingBookings = userBookings.filter(booking =>
    booking.status === 'pending' && booking.paymentStatus === 'pending'
  );
  const otherBookings = userBookings.filter(booking =>
    !(booking.status === 'pending' && booking.paymentStatus === 'pending')
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refetch from server
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateBookingStatus(booking.id, 'cancelled');
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success[500];
      case 'pending':
        return theme.colors.warning[500];
      case 'cancelled':
        return theme.colors.danger[500];
      case 'completed':
        return theme.colors.info[500];
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'flag';
      default:
        return 'help-circle';
    }
  };

  const renderBooking = ({ item: booking }: { item: Booking }) => {
    const hotel = getHotelById(booking.hotelId);
    const rooms = getRoomsByHotelId(booking.hotelId);
    const room = rooms.find(r => r.id === booking.roomId);

    if (!hotel || !room) return null;

    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const isUpcoming = checkInDate > new Date();
    const canCancel = booking.status === 'pending' || (booking.status === 'confirmed' && isUpcoming);
    const canPay = booking.paymentStatus === 'pending';
    const isPendingBooking = booking.status === 'pending' && booking.paymentStatus === 'pending';

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
            <Ionicons
              name={getStatusIcon(booking.status)}
              size={14}
              color={getStatusColor(booking.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomType}>Room #{room.roomNumber} • {room.type}</Text>

        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateValue}>{checkInDate.toLocaleDateString()}</Text>
            <Text style={styles.timeValue}>{checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateValue}>{checkOutDate.toLocaleDateString()}</Text>
            <Text style={styles.timeValue}>{checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>
              {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} night{Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>GH₵{booking.totalPrice.toFixed(2)}</Text>
        </View>

        <Text style={styles.bookingId}>Booking ID: {booking.id}</Text>

        {/* Show different actions based on booking status */}
        {isPendingBooking && (
          <View style={styles.actionRow}>
            <Button
              title="🛒 Complete Booking"
              onPress={() => {
                // Navigate to Hotels stack, then to Payment
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                  parentNavigation.navigate('Hotels', {
                    screen: 'Payment',
                    params: {
                      amount: booking.totalPrice,
                      currency: 'GHS',
                      paymentFor: 'booking',
                      referenceId: booking.id
                    }
                  });
                }
              }}
              style={styles.primaryPayButton}
            />
            <Button
              title="Remove"
              variant="outline"
              onPress={() => handleCancelBooking(booking)}
              style={styles.cancelButton}
            />
          </View>
        )}

        {canCancel && !isPendingBooking && (
          <View style={styles.actionRow}>
            <Button
              title="Cancel Booking"
              variant="outline"
              onPress={() => handleCancelBooking(booking)}
              style={styles.cancelButton}
            />
          </View>
        )}

        {canPay && !isPendingBooking && (
          <View style={styles.actionRow}>
            <Button
              title="Pay Now"
              onPress={() => {
                // Navigate to Hotels stack, then to Payment
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                  parentNavigation.navigate('Hotels', {
                    screen: 'Payment',
                    params: {
                      amount: booking.totalPrice,
                      currency: 'GHS',
                      paymentFor: 'booking',
                      referenceId: booking.id
                    }
                  });
                }
              }}
              style={styles.payButton}
            />
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptySubtitle}>
        When you book a hotel, your reservations will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'header'}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Booking Cart Section */}
            {pendingBookings.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cart" size={20} color={theme.colors.primary[500]} />
                  <Text style={styles.sectionTitle}>Booking Cart ({pendingBookings.length})</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Complete your bookings below</Text>
                {pendingBookings.map((booking) => (
                  <View key={booking.id}>
                    {renderBooking({ item: booking })}
                  </View>
                ))}
              </View>
            )}

            {/* Other Bookings Section */}
            {otherBookings.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={20} color={theme.colors.text.primary} />
                  <Text style={styles.sectionTitle}>My Bookings ({otherBookings.length})</Text>
                </View>
                {otherBookings.map((booking) => (
                  <View key={booking.id}>
                    {renderBooking({ item: booking })}
                  </View>
                ))}
              </View>
            )}

            {/* Empty State */}
            {userBookings.length === 0 && renderEmptyState()}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  bookingCard: {
    marginBottom: theme.spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  hotelName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  statusText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  roomName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  roomType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  dateColumn: {
    flex: 1,
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
  timeValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  totalPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary[500],
  },
  bookingId: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  actionRow: {
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    borderColor: theme.colors.danger[500],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  payButton: {
    borderColor: theme.colors.success[500],
    backgroundColor: theme.colors.success[500],
    color: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary[500],
  },
  primaryPayButton: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[500],
    color: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
  },
});

export default BookingsScreen;