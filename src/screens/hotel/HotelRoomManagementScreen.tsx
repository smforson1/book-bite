import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../../components';
import ImageUpload from '../../components/ImageUpload';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useHotel } from '../../contexts/HotelContext';
// ThemeContext import removed as part of dark mode revert

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  description: string;
  price: number;
  capacity: number;
  isAvailable: boolean;
  isOccupied: boolean;
  amenities: string[];
  images: string[]; // Updated to store multiple images
}

const HotelRoomManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const { addRoom, updateRoom } = useHotel();
  // Theme hook removed as part of dark mode revert
  const currentTheme = theme;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    roomNumber: '',
    type: 'Standard',
    description: '',
    price: 0,
    capacity: 2,
    isAvailable: true,
    isOccupied: false,
    amenities: [],
    images: [],
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    // In a real app, this would load from the hotel context
    // For now, we'll use mock data
    const mockRooms: Room[] = [
      {
        id: '1',
        roomNumber: '101',
        type: 'Standard',
        description: 'Comfortable standard room with city view',
        price: 150.00,
        capacity: 2,
        isAvailable: true,
        isOccupied: false,
        amenities: ['WiFi', 'AC', 'TV', 'Private Bathroom'],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
        ],
      },
      {
        id: '2',
        roomNumber: '201',
        type: 'Deluxe',
        description: 'Spacious deluxe room with balcony and garden view',
        price: 250.00,
        capacity: 3,
        isAvailable: true,
        isOccupied: true,
        amenities: ['WiFi', 'AC', 'TV', 'Balcony', 'Mini Bar', 'Room Service'],
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
      },
    ];
    setRooms(mockRooms);
  };

  const handleImagesUploaded = (imageUrls: string[]) => {
    setNewRoom({ ...newRoom, images: imageUrls });
  };

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.type || !newRoom.description || !newRoom.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const roomData = {
        ...newRoom,
        id: Date.now().toString(),
        roomNumber: newRoom.roomNumber!,
        type: newRoom.type!,
        description: newRoom.description!,
        price: newRoom.price!,
        capacity: newRoom.capacity || 2,
        isAvailable: newRoom.isAvailable ?? true,
        isOccupied: newRoom.isOccupied ?? false,
        amenities: newRoom.amenities || [],
        images: newRoom.images || [],
        hotelId: user?.id || '', // Associate with hotel owner
      };

      // In a real app, we would call addRoom from the context
      // await addRoom(roomData);

      setRooms([...rooms, roomData as Room]);
      setNewRoom({
        roomNumber: '',
        type: 'Standard',
        description: '',
        price: 0,
        capacity: 2,
        isAvailable: true,
        isOccupied: false,
        amenities: [],
        images: [],
      });
      setShowAddModal(false);
      Alert.alert('Success', 'Room added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add room. Please try again.');
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setNewRoom(room);
    setShowAddModal(true);
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom) return;

    try {
      const updatedRoom = {
        ...editingRoom,
        ...newRoom,
      };

      // In a real app, we would call updateRoom from the context
      // await updateRoom(updatedRoom.id, updatedRoom);

      const updatedRooms = rooms.map(room =>
        room.id === editingRoom.id ? updatedRoom : room
      );

      setRooms(updatedRooms);
      setEditingRoom(null);
      setNewRoom({
        roomNumber: '',
        type: 'Standard',
        description: '',
        price: 0,
        capacity: 2,
        isAvailable: true,
        isOccupied: false,
        amenities: [],
        images: [],
      });
      setShowAddModal(false);
      Alert.alert('Success', 'Room updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update room. Please try again.');
    }
  };

  const handleDeleteRoom = (id: string) => {
    Alert.alert(
      'Delete Room',
      'Are you sure you want to delete this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, we would call a delete function from the context
            setRooms(rooms.filter(room => room.id !== id));
            Alert.alert('Success', 'Room deleted successfully!');
          },
        },
      ]
    );
  };

  const toggleAvailability = (id: string) => {
    setRooms(rooms.map(room =>
      room.id === id
        ? { ...room, isAvailable: !room.isAvailable }
        : room
    ));
  };

  const toggleOccupancy = (id: string) => {
    setRooms(rooms.map(room =>
      room.id === id
        ? { ...room, isOccupied: !room.isOccupied }
        : room
    ));
  };

  const getRoomStatus = (room: Room) => {
    if (room.isOccupied) return { text: 'Occupied', style: [styles.occupied, { backgroundColor: currentTheme.colors.warning[50] }] };
    if (!room.isAvailable) return { text: 'Maintenance', style: [styles.maintenance, { backgroundColor: currentTheme.colors.error[50] }] };
    return { text: 'Available', style: [styles.available, { backgroundColor: currentTheme.colors.success[50] }] };
  };

  const renderRoom = (room: Room) => {
    const status = getRoomStatus(room);

    return (
      <Card key={room.id} style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text style={[globalStyles.h4, styles.roomNumber, { color: currentTheme.colors.text.primary }]}>Room {room.roomNumber}</Text>
            <Text style={[styles.roomType, { color: currentTheme.colors.primary[500] }]}>{room.type}</Text>
            <Text style={[styles.roomDescription, { color: currentTheme.colors.text.secondary }]} numberOfLines={2}>{room.description}</Text>
          </View>
          <View style={styles.roomActions}>
            <Text style={[globalStyles.h4, styles.roomPrice, { color: currentTheme.colors.primary[500] }]}>GH₵{room.price.toFixed(2)}/night</Text>
            <View style={[styles.statusBadge, status.style]}>
              <Text style={[styles.statusText, { color: currentTheme.colors.text.primary }]}>{status.text}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: currentTheme.colors.primary[50] }]}
                onPress={() => handleEditRoom(room)}
              >
                <Ionicons name="pencil" size={16} color={currentTheme.colors.primary[500]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: currentTheme.colors.error[50] }]}
                onPress={() => handleDeleteRoom(room.id)}
              >
                <Ionicons name="trash" size={16} color={currentTheme.colors.error[500]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Image Preview */}
        {room.images && room.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
            {room.images.slice(0, 3).map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.roomImagePreview}
              />
            ))}
            {room.images.length > 3 && (
              <View style={[styles.roomImagePreview, styles.moreImagesOverlay, { backgroundColor: currentTheme.colors.background.secondary }]}>
                <Text style={[styles.moreImagesText, { color: currentTheme.colors.text.primary }]}>+{room.images.length - 3}</Text>
              </View>
            )}
          </ScrollView>
        )}

        <View style={[styles.roomDetails, { borderTopColor: currentTheme.colors.border.light }]}>
          <View style={styles.detailRow}>
            <Ionicons name="people" size={16} color={currentTheme.colors.text.secondary} />
            <Text style={[styles.detailText, { color: currentTheme.colors.text.secondary }]}>Capacity: {room.capacity} guests</Text>
          </View>
          <View style={styles.amenities}>
            <Text style={[styles.amenitiesLabel, { color: currentTheme.colors.text.primary }]}>Amenities:</Text>
            <Text style={[styles.amenitiesText, { color: currentTheme.colors.text.secondary }]}>
              {room.amenities.length > 0 ? room.amenities.join(', ') : 'Basic amenities'}
            </Text>
          </View>
        </View>

        <View style={[styles.roomControls, { borderTopColor: currentTheme.colors.border.light }]}>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: currentTheme.colors.text.primary }]}>Available for Booking</Text>
            <Switch
              value={room.isAvailable}
              onValueChange={() => toggleAvailability(room.id)}
              trackColor={{ false: currentTheme.colors.neutral[300], true: currentTheme.colors.primary[500] + '40' }}
              thumbColor={room.isAvailable ? currentTheme.colors.primary[500] : currentTheme.colors.neutral[400]}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={[styles.controlLabel, { color: currentTheme.colors.text.primary }]}>Currently Occupied</Text>
            <Switch
              value={room.isOccupied}
              onValueChange={() => toggleOccupancy(room.id)}
              trackColor={{ false: currentTheme.colors.neutral[300], true: currentTheme.colors.warning[500] + '40' }}
              thumbColor={room.isOccupied ? currentTheme.colors.warning[500] : currentTheme.colors.neutral[400]}
            />
          </View>
        </View>
      </Card>
    );
  };

  const renderAddEditModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: currentTheme.colors.background.primary }]}>
        <View style={[styles.modalHeader, { borderBottomColor: currentTheme.colors.border.light }]}>
          <TouchableOpacity
            onPress={() => {
              setShowAddModal(false);
              setEditingRoom(null);
              setNewRoom({
                roomNumber: '',
                type: 'Standard',
                description: '',
                price: 0,
                capacity: 2,
                isAvailable: true,
                isOccupied: false,
                amenities: [],
                images: [],
              });
            }}
          >
            <Ionicons name="close" size={24} color={currentTheme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[globalStyles.h3, styles.modalTitle, { color: currentTheme.colors.text.primary }]}>
            {editingRoom ? 'Edit Room' : 'Add Room'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <Input
            label="Room Number *"
            placeholder="Enter room number"
            value={newRoom.roomNumber || ''}
            onChangeText={(text) => setNewRoom({ ...newRoom, roomNumber: text })}
          />

          <Input
            label="Room Type *"
            placeholder="Standard, Deluxe, Suite, etc."
            value={newRoom.type || ''}
            onChangeText={(text) => setNewRoom({ ...newRoom, type: text })}
          />

          <Input
            label="Description *"
            placeholder="Enter room description"
            value={newRoom.description || ''}
            onChangeText={(text) => setNewRoom({ ...newRoom, description: text })}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Price per Night (GH₵) *"
            placeholder="0.00"
            value={newRoom.price?.toString() || ''}
            onChangeText={(text) => setNewRoom({ ...newRoom, price: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />

          <Input
            label="Guest Capacity"
            placeholder="2"
            value={newRoom.capacity?.toString() || ''}
            onChangeText={(text) => setNewRoom({ ...newRoom, capacity: parseInt(text) || 2 })}
            keyboardType="numeric"
          />

          <Input
            label="Amenities (comma separated)"
            placeholder="WiFi, AC, TV, etc."
            value={newRoom.amenities?.join(', ') || ''}
            onChangeText={(text) => setNewRoom({ ...newRoom, amenities: text.split(',').map(s => s.trim()).filter(s => s) })}
            multiline
          />

          {/* Image Upload Component */}
          <ImageUpload
            onImagesUploaded={handleImagesUploaded}
            maxImages={5}
            allowMultiple={true}
            title="Room Images"
            subtitle="Add photos of this room type"
            existingImages={newRoom.images || []}
          />

          <View style={[styles.switchRow, { borderBottomColor: currentTheme.colors.border.light }]}>
            <Text style={[styles.switchLabel, { color: currentTheme.colors.text.primary }]}>Available for Booking</Text>
            <Switch
              value={newRoom.isAvailable ?? true}
              onValueChange={(value) => setNewRoom({ ...newRoom, isAvailable: value })}
              trackColor={{ false: currentTheme.colors.neutral[300], true: currentTheme.colors.primary[500] + '40' }}
              thumbColor={newRoom.isAvailable ? currentTheme.colors.primary[500] : currentTheme.colors.neutral[400]}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomColor: currentTheme.colors.border.light }]}>
            <Text style={[styles.switchLabel, { color: currentTheme.colors.text.primary }]}>Currently Occupied</Text>
            <Switch
              value={newRoom.isOccupied ?? false}
              onValueChange={(value) => setNewRoom({ ...newRoom, isOccupied: value })}
              trackColor={{ false: currentTheme.colors.neutral[300], true: currentTheme.colors.warning[500] + '40' }}
              thumbColor={newRoom.isOccupied ? currentTheme.colors.warning[500] : currentTheme.colors.neutral[400]}
            />
          </View>

          <Button
            title={editingRoom ? 'Update Room' : 'Add Room'}
            onPress={editingRoom ? handleUpdateRoom : handleAddRoom}
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background.secondary }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: currentTheme.colors.primary[500] }]}>{rooms.length}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.text.secondary }]}>Total Rooms</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: currentTheme.colors.success[500] }]}>
              {rooms.filter(room => room.isAvailable && !room.isOccupied).length}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.text.secondary }]}>Available</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: currentTheme.colors.warning[500] }]}>
              {rooms.filter(room => room.isOccupied).length}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.colors.text.secondary }]}>Occupied</Text>
          </Card>
        </View>

        <View style={styles.roomList}>
          {rooms.map(renderRoom)}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: currentTheme.colors.primary[500] }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={currentTheme.colors.text.inverse} />
      </TouchableOpacity>

      {renderAddEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  stats: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },

  statLabel: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
  },

  roomList: {
    paddingBottom: theme.spacing.xl,
  },

  roomCard: {
    marginBottom: theme.spacing.md,
  },

  roomHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },

  roomInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },

  roomNumber: {
    marginBottom: theme.spacing.xs,
  },

  roomType: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },

  roomDescription: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },

  roomActions: {
    alignItems: 'flex-end',
  },

  roomPrice: {
    marginBottom: theme.spacing.sm,
  },

  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },

  available: {
  },

  occupied: {
  },

  maintenance: {
  },

  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },

  editButton: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },

  deleteButton: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },

  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },

  roomImagePreview: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },

  moreImagesOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  moreImagesText: {
    fontWeight: theme.typography.fontWeight.bold,
  },

  roomDetails: {
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  detailText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
  },

  amenities: {
    marginTop: theme.spacing.sm,
  },

  amenitiesLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },

  amenitiesText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
  },

  roomControls: {
    borderTopWidth: 1,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },

  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  controlLabel: {
    fontSize: theme.typography.fontSize.sm,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },

  modalTitle: {
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },

  switchLabel: {
    fontSize: theme.typography.fontSize.md,
  },

  submitButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
});

export default HotelRoomManagementScreen;