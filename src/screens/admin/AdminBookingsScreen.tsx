import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useHotel } from '../../contexts/HotelContext';
import { useAuth } from '../../contexts/AuthContext';
import { Booking, Hotel, Room } from '../../types';

const AdminBookingsScreen: React.FC = () => {
  const { user } = useAuth();
  const { 
    bookings, 
    hotels, 
    rooms,
    getHotelById, 
    getRoomsByHotelId, 
    updateBookingStatus,
    updateRoomPrice,
    updateRoom,
    createBooking
  } = useHotel();
  
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRoomPriceModal, setShowRoomPriceModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [editingBooking, setEditingBooking] = useState<{
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
  } | null>(null);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedFilter]);

  const filterBookings = () => {
    let filtered = [...bookings];
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === selectedFilter);
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredBookings(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refetch from server
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleStatusChange = async (booking: Booking, newStatus: Booking['status']) => {
    try {
      await updateBookingStatus(booking.id, newStatus);
      Alert.alert('Success', `Booking status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const openEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditingBooking({
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut),
      guests: booking.guests,
      totalPrice: booking.totalPrice,
    });
    setShowEditModal(true);
  };

  const handleEditBooking = async () => {
    if (!selectedBooking || !editingBooking) return;

    try {
      // Calculate new total price based on nights and room price
      const room = rooms.find(r => r.id === selectedBooking.roomId);
      const nights = Math.ceil((editingBooking.checkOut.getTime() - editingBooking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const newTotalPrice = room ? room.price * nights : editingBooking.totalPrice;

      // Create a new booking with updated details (simulating booking modification)
      await createBooking({
        userId: selectedBooking.userId,
        roomId: selectedBooking.roomId,
        hotelId: selectedBooking.hotelId,
        checkIn: editingBooking.checkIn,
        checkOut: editingBooking.checkOut,
        guests: editingBooking.guests,
        totalPrice: newTotalPrice,
        status: 'confirmed',
        paymentStatus: 'pending',
      });

      // Cancel the original booking
      await updateBookingStatus(selectedBooking.id, 'cancelled');
      
      Alert.alert('Success', 'Booking has been modified successfully. Original booking cancelled and new booking created.');
      setShowEditModal(false);
      setSelectedBooking(null);
      setEditingBooking(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to modify booking');
    }
  };

  const openRoomPriceModal = (room: Room) => {
    setSelectedRoom(room);
    setNewPrice(room.price.toString());
    setShowRoomPriceModal(true);
  };

  const handleUpdateRoomPrice = async () => {
    if (!selectedRoom) return;

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      await updateRoomPrice(selectedRoom.id, price);
      Alert.alert('Success', `Room price updated to $${price.toFixed(2)}`);
      setShowRoomPriceModal(false);
      setSelectedRoom(null);
      setNewPrice('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update room price');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date, type: 'checkIn' | 'checkOut' = 'checkIn') => {
    if (!editingBooking) return;
    
    const currentDate = selectedDate || (type === 'checkIn' ? editingBooking.checkIn : editingBooking.checkOut);
    
    if (type === 'checkIn') {
      setShowCheckInPicker(false);
      if (currentDate >= new Date()) {
        setEditingBooking({
          ...editingBooking,
          checkIn: currentDate,
          checkOut: currentDate >= editingBooking.checkOut 
            ? new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
            : editingBooking.checkOut
        });
      }
    } else {
      setShowCheckOutPicker(false);
      if (currentDate > editingBooking.checkIn) {
        setEditingBooking({
          ...editingBooking,
          checkOut: currentDate
        });
      }
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return theme.colors.success[500];
      case 'pending': return theme.colors.warning[500];
      case 'cancelled': return theme.colors.danger[500];
      case 'completed': return theme.colors.info[500];
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'flag';
      default: return 'help-circle';
    }
  };

  const renderFilterButton = (filter: typeof selectedFilter, label: string) => (
    <TouchableOpacity
      key={filter}
      style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderBooking = ({ item: booking }: { item: Booking }) => {
    const hotel = getHotelById(booking.hotelId);
    const room = rooms.find(r => r.id === booking.roomId);
    
    if (!hotel || !room) return null;

    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <Text style={styles.roomName}>{room.name} - Room #{room.roomNumber}</Text>
          </View>
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

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dates:</Text>
            <Text style={styles.detailValue}>
              {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()} ({nights} night{nights > 1 ? 's' : ''})
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Guests:</Text>
            <Text style={styles.detailValue}>{booking.guests}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={[styles.detailValue, styles.priceText]}>${booking.totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Room Price:</Text>
            <Text style={styles.detailValue}>${room.price}/night</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]} 
            onPress={() => openEditModal(booking)}
          >
            <Ionicons name="pencil" size={16} color={theme.colors.primary[500]} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary[500] }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.priceButton]} 
            onPress={() => openRoomPriceModal(room)}
          >
            <Ionicons name="pricetag" size={16} color={theme.colors.warning[600]} />
            <Text style={[styles.actionButtonText, { color: theme.colors.warning[600] }]}>Price</Text>
          </TouchableOpacity>

          {booking.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]} 
              onPress={() => handleStatusChange(booking, 'confirmed')}
            >
              <Ionicons name="checkmark" size={16} color={theme.colors.success[500]} />
              <Text style={[styles.actionButtonText, { color: theme.colors.success[500] }]}>Confirm</Text>
            </TouchableOpacity>
          )}

          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => handleStatusChange(booking, 'cancelled')}
            >
              <Ionicons name="close" size={16} color={theme.colors.danger[500]} />
              <Text style={[styles.actionButtonText, { color: theme.colors.danger[500] }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.bookingId}>ID: {booking.id}</Text>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No Bookings Found</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'all' 
          ? 'No bookings have been made yet' 
          : `No ${selectedFilter} bookings found`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('confirmed', 'Confirmed')}
        {renderFilterButton('cancelled', 'Cancelled')}
        {renderFilterButton('completed', 'Completed')}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Edit Booking Modal */}
      {selectedBooking && editingBooking && (
        <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Booking</Text>
              <TouchableOpacity onPress={handleEditBooking}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.fieldLabel}>Check-in Date</Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowCheckInPicker(true)}
              >
                <Text style={styles.dateText}>{editingBooking.checkIn.toLocaleDateString()}</Text>
                <Ionicons name="calendar" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Check-out Date</Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Text style={styles.dateText}>{editingBooking.checkOut.toLocaleDateString()}</Text>
                <Ionicons name="calendar" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Number of Guests</Text>
              <View style={styles.guestControls}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setEditingBooking({ 
                    ...editingBooking, 
                    guests: Math.max(1, editingBooking.guests - 1) 
                  })}
                >
                  <Ionicons name="remove" size={20} color={theme.colors.primary[500]} />
                </TouchableOpacity>
                <Text style={styles.guestCount}>{editingBooking.guests}</Text>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setEditingBooking({ 
                    ...editingBooking, 
                    guests: Math.min(8, editingBooking.guests + 1) 
                  })}
                >
                  <Ionicons name="add" size={20} color={theme.colors.primary[500]} />
                </TouchableOpacity>
              </View>
            </View>

            {showCheckInPicker && (
              <DateTimePicker
                value={editingBooking.checkIn}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(event, date, 'checkIn')}
                minimumDate={new Date()}
              />
            )}
            
            {showCheckOutPicker && (
              <DateTimePicker
                value={editingBooking.checkOut}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(event, date, 'checkOut')}
                minimumDate={new Date(editingBooking.checkIn.getTime() + 24 * 60 * 60 * 1000)}
              />
            )}
          </SafeAreaView>
        </Modal>
      )}

      {/* Room Price Modal */}
      {selectedRoom && (
        <Modal visible={showRoomPriceModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRoomPriceModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Update Room Price</Text>
              <TouchableOpacity onPress={handleUpdateRoomPrice}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.roomInfoText}>{selectedRoom.name}</Text>
              <Text style={styles.roomInfoSubtext}>Room #{selectedRoom.roomNumber}</Text>
              
              <Text style={styles.fieldLabel}>Current Price: ${selectedRoom.price}/night</Text>
              <TextInput
                style={styles.priceInput}
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="Enter new price"
                keyboardType="numeric"
              />
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary[500],
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  activeFilterText: {
    color: theme.colors.neutral[0],
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
    marginBottom: theme.spacing.md,
  },
  bookingInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  hotelName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  roomName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
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
  bookingDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  priceText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.bold as '700',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  editButton: {
    backgroundColor: theme.colors.primary[50],
  },
  priceButton: {
    backgroundColor: theme.colors.warning[50],
  },
  confirmButton: {
    backgroundColor: theme.colors.success[50],
  },
  cancelButton: {
    backgroundColor: theme.colors.danger[50],
  },
  actionButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  bookingId: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  saveText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCount: {
    marginHorizontal: theme.spacing.lg,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  roomInfoText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  roomInfoSubtext: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
});

export default AdminBookingsScreen;