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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

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
  imageUrl?: string;
}

const HotelRoomManagementScreen: React.FC = () => {
  const { user } = useAuth();
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
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    // Mock data - in real app, load from API
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
      },
      {
        id: '3',
        roomNumber: '301',
        type: 'Suite',
        description: 'Luxury suite with separate living area and premium amenities',
        price: 450.00,
        capacity: 4,
        isAvailable: false,
        isOccupied: false,
        amenities: ['WiFi', 'AC', 'TV', 'Living Area', 'Kitchenette', 'Balcony', 'Premium Bathroom'],
      },
    ];
    setRooms(mockRooms);
  };

  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !newRoom.type || !newRoom.description || !newRoom.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const room: Room = {
      id: Date.now().toString(),
      roomNumber: newRoom.roomNumber!,
      type: newRoom.type!,
      description: newRoom.description!,
      price: newRoom.price!,
      capacity: newRoom.capacity || 2,
      isAvailable: newRoom.isAvailable ?? true,
      isOccupied: newRoom.isOccupied ?? false,
      amenities: newRoom.amenities || [],
    };

    setRooms([...rooms, room]);
    setNewRoom({
      roomNumber: '',
      type: 'Standard',
      description: '',
      price: 0,
      capacity: 2,
      isAvailable: true,
      isOccupied: false,
      amenities: [],
    });
    setShowAddModal(false);
    Alert.alert('Success', 'Room added successfully!');
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setNewRoom(room);
    setShowAddModal(true);
  };

  const handleUpdateRoom = () => {
    if (!editingRoom) return;

    const updatedRooms = rooms.map(room =>
      room.id === editingRoom.id
        ? { ...room, ...newRoom }
        : room
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
    });
    setShowAddModal(false);
    Alert.alert('Success', 'Room updated successfully!');
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
    if (room.isOccupied) return { text: 'Occupied', style: styles.occupied };
    if (!room.isAvailable) return { text: 'Maintenance', style: styles.maintenance };
    return { text: 'Available', style: styles.available };
  };

  const renderRoom = (room: Room) => {
    const status = getRoomStatus(room);
    
    return (
      <Card key={room.id} style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomInfo}>
            <Text style={[globalStyles.h4, styles.roomNumber]}>Room {room.roomNumber}</Text>
            <Text style={styles.roomType}>{room.type}</Text>
            <Text style={styles.roomDescription} numberOfLines={2}>{room.description}</Text>
          </View>
          <View style={styles.roomActions}>
            <Text style={[globalStyles.h4, styles.roomPrice]}>GH₵{room.price.toFixed(2)}/night</Text>
            <View style={[styles.statusBadge, status.style]}>
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => handleEditRoom(room)}
              >
                <Ionicons name="pencil" size={16} color={theme.colors.primary[500]} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteRoom(room.id)}
              >
                <Ionicons name="trash" size={16} color={theme.colors.error[500]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.roomDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="people" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>Capacity: {room.capacity} guests</Text>
          </View>
          <View style={styles.amenities}>
            <Text style={styles.amenitiesLabel}>Amenities:</Text>
            <Text style={styles.amenitiesText}>
              {room.amenities.length > 0 ? room.amenities.join(', ') : 'Basic amenities'}
            </Text>
          </View>
        </View>

        <View style={styles.roomControls}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Available for Booking</Text>
            <Switch
              value={room.isAvailable}
              onValueChange={() => toggleAvailability(room.id)}
              trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
              thumbColor={room.isAvailable ? theme.colors.primary[500] : theme.colors.neutral[400]}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Currently Occupied</Text>
            <Switch
              value={room.isOccupied}
              onValueChange={() => toggleOccupancy(room.id)}
              trackColor={{ false: theme.colors.neutral[300], true: theme.colors.warning[500] + '40' }}
              thumbColor={room.isOccupied ? theme.colors.warning[500] : theme.colors.neutral[400]}
            />
          </View>
        </View>
      </Card>
    );
  };

  const renderAddEditModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
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
              });
            }}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[globalStyles.h3, styles.modalTitle]}>
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

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Available for Booking</Text>
            <Switch
              value={newRoom.isAvailable ?? true}
              onValueChange={(value) => setNewRoom({ ...newRoom, isAvailable: value })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Currently Occupied</Text>
            <Switch
              value={newRoom.isOccupied ?? false}
              onValueChange={(value) => setNewRoom({ ...newRoom, isOccupied: value })}
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: theme.colors.primary[500] }]}>{rooms.length}</Text>
            <Text style={styles.statLabel}>Total Rooms</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: theme.colors.success[500] }]}>
              {rooms.filter(room => room.isAvailable && !room.isOccupied).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: theme.colors.warning[500] }]}>
              {rooms.filter(room => room.isOccupied).length}
            </Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </Card>
        </View>

        <View style={styles.roomList}>
          {rooms.map(renderRoom)}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={theme.colors.text.inverse} />
      </TouchableOpacity>

      {renderAddEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
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
    backgroundColor: theme.colors.success[500],
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
    color: theme.colors.text.secondary,
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
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  roomType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  
  roomDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  
  roomActions: {
    alignItems: 'flex-end',
  },
  
  roomPrice: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  
  available: {
    backgroundColor: theme.colors.success[50],
  },
  
  occupied: {
    backgroundColor: theme.colors.warning[50],
  },
  
  maintenance: {
    backgroundColor: theme.colors.error[50],
  },
  
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  editButton: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  
  deleteButton: {
    backgroundColor: theme.colors.error[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  
  roomDetails: {
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  detailText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  
  amenities: {
    marginTop: theme.spacing.sm,
  },
  
  amenitiesLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  amenitiesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  
  roomControls: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
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
    color: theme.colors.text.secondary,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  
  modalTitle: {
    color: theme.colors.text.primary,
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
    borderBottomColor: theme.colors.border.light,
  },
  
  switchLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  
  submitButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
});

export default HotelRoomManagementScreen;