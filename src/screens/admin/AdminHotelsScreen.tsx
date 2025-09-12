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
import { Button, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useHotel } from '../../contexts/HotelContext';
import { useAuth } from '../../contexts/AuthContext';
import { Hotel, Room } from '../../types';

const AdminHotelsScreen: React.FC = () => {
  const { user } = useAuth();
  const { 
    hotels, 
    rooms,
    getRoomsByHotelId,
    updateRoomPrice,
    addRoom,
    removeRoom
  } = useHotel();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewRooms = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowRoomsModal(true);
  };

  const handleEditPrice = (room: Room) => {
    setSelectedRoom(room);
    setNewPrice(room.price.toString());
    setShowPriceModal(true);
  };

  const handleUpdatePrice = async () => {
    if (!selectedRoom || !newPrice) return;
    
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setIsUpdating(true);
    try {
      await updateRoomPrice(selectedRoom.id, price);
      setShowPriceModal(false);
      setSelectedRoom(null);
      setNewPrice('');
      Alert.alert('Success', 'Room price updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update room price');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderHotel = ({ item: hotel }: { item: Hotel }) => {
    const hotelRooms = getRoomsByHotelId(hotel.id);
    const avgPrice = hotelRooms.length > 0 
      ? hotelRooms.reduce((sum, room) => sum + room.price, 0) / hotelRooms.length
      : 0;

    return (
      <Card style={styles.hotelCard}>
        <View style={styles.hotelHeader}>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <Text style={styles.hotelLocation}>
              <Ionicons name="location-outline" size={14} color={theme.colors.text.tertiary} />
              {' '}{hotel.address}
            </Text>
            <View style={styles.hotelStats}>
              <Text style={styles.statText}>{hotelRooms.length} rooms</Text>
              <Text style={styles.statText}>Avg: ${avgPrice.toFixed(2)}/night</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={theme.colors.warning[500]} />
                <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewRoomsButton}
            onPress={() => handleViewRooms(hotel)}
          >
            <Ionicons name="bed-outline" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.viewRoomsText}>Manage Rooms</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderRoom = ({ item: room }: { item: Room }) => (
    <Card style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomType}>{room.type}</Text>
          <Text style={styles.roomDetails}>
            <Ionicons name="people-outline" size={14} color={theme.colors.text.tertiary} />
            {' '}{room.capacity} guests
          </Text>
          <Text style={styles.roomPrice}>${room.price}/night</Text>
        </View>
        <TouchableOpacity
          style={styles.editPriceButton}
          onPress={() => handleEditPrice(room)}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.primary[500]} />
          <Text style={styles.editPriceText}>Edit Price</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.amenitiesContainer}>
        {room.amenities.slice(0, 3).map((amenity, index) => (
          <View key={index} style={styles.amenityTag}>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
        {room.amenities.length > 3 && (
          <Text style={styles.moreAmenities}>+{room.amenities.length - 3} more</Text>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hotel Management</Text>
        <Text style={styles.subtitle}>Manage hotels and room pricing</Text>
      </View>

      <FlatList
        data={hotels}
        renderItem={renderHotel}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Rooms Management Modal */}
      <Modal
        visible={showRoomsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowRoomsModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedHotel?.name} - Rooms
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <FlatList
            data={selectedHotel ? getRoomsByHotelId(selectedHotel.id) : []}
            renderItem={renderRoom}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.roomsList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Price Edit Modal */}
      <Modal
        visible={showPriceModal}
        animationType="fade"
        transparent
      >
        <View style={styles.priceModalOverlay}>
          <View style={styles.priceModalContent}>
            <Text style={styles.priceModalTitle}>Edit Room Price</Text>
            <Text style={styles.roomTypeText}>{selectedRoom?.type}</Text>
            
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Price per night ($)</Text>
              <TextInput
                style={styles.priceInput}
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="Enter new price"
                keyboardType="numeric"
                autoFocus
              />
            </View>
            
            <View style={styles.priceModalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowPriceModal(false);
                  setSelectedRoom(null);
                  setNewPrice('');
                }}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={isUpdating ? "Updating..." : "Update Price"}
                onPress={handleUpdatePrice}
                disabled={isUpdating || !newPrice}
                style={styles.updateButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  hotelCard: {
    marginBottom: theme.spacing.md,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hotelInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  hotelName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  hotelLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  hotelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.warning[700],
    marginLeft: 2,
  },
  viewRoomsButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
  },
  viewRoomsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
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
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  roomsList: {
    padding: theme.spacing.md,
  },
  roomCard: {
    marginBottom: theme.spacing.md,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  roomInfo: {
    flex: 1,
  },
  roomType: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  roomDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  roomPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  editPriceButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
  },
  editPriceText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  amenityTag: {
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  amenityText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  moreAmenities: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    alignSelf: 'center',
  },
  priceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceModalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '85%',
    maxWidth: 350,
  },
  priceModalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  roomTypeText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  priceInputContainer: {
    marginBottom: theme.spacing.lg,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  priceModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  updateButton: {
    flex: 1,
  },
});

export default AdminHotelsScreen;