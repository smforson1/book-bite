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
import { useRestaurant } from '../../contexts/RestaurantContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isInStock: boolean;
  preparationTime: number; // in minutes
  images: string[]; // Updated to store multiple images
}

const RestaurantMenuManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const { addMenuItem, updateMenuItem } = useRestaurant();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    isAvailable: true,
    isInStock: true,
    preparationTime: 15,
    images: [],
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = () => {
    // Mock data - in real app, load from API
    const mockItems: MenuItem[] = [
      {
        id: '1',
        name: 'Jollof Rice with Chicken',
        description: 'Traditional Ghanaian jollof rice served with grilled chicken',
        price: 25.00,
        category: 'Main Course',
        isAvailable: true,
        isInStock: true,
        preparationTime: 30,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
        ],
      },
      {
        id: '2',
        name: 'Banku with Tilapia',
        description: 'Fresh banku served with grilled tilapia and pepper sauce',
        price: 20.00,
        category: 'Main Course',
        isAvailable: true,
        isInStock: false,
        preparationTime: 25,
        images: [
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
        ],
      },
      {
        id: '3',
        name: 'Kelewele',
        description: 'Spicy fried plantain cubes with ginger and pepper',
        price: 8.00,
        category: 'Appetizer',
        isAvailable: true,
        isInStock: true,
        preparationTime: 10,
        images: [
          'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800'
        ],
      },
    ];
    setMenuItems(mockItems);
  };

  const handleImagesUploaded = (imageUrls: string[]) => {
    setNewItem({ ...newItem, images: imageUrls });
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        ...newItem,
        id: Date.now().toString(),
        name: newItem.name!,
        description: newItem.description!,
        price: newItem.price!,
        category: newItem.category || 'Main Course',
        isAvailable: newItem.isAvailable ?? true,
        isInStock: newItem.isInStock ?? true,
        preparationTime: newItem.preparationTime || 15,
        images: newItem.images || [],
        restaurantId: user?.id || '', // Associate with restaurant owner
      };

      // In a real app, we would call addMenuItem from the context
      // await addMenuItem(itemData);
      
      setMenuItems([...menuItems, itemData as MenuItem]);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        isAvailable: true,
        isInStock: true,
        preparationTime: 15,
        images: [],
      });
      setShowAddModal(false);
      Alert.alert('Success', 'Menu item added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add menu item. Please try again.');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem(item);
    setShowAddModal(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const updatedItem = {
        ...editingItem,
        ...newItem,
      };

      // In a real app, we would call updateMenuItem from the context
      // await updateMenuItem(updatedItem.id, updatedItem);
      
      const updatedItems = menuItems.map(item =>
        item.id === editingItem.id ? updatedItem : item
      );

      setMenuItems(updatedItems);
      setEditingItem(null);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'Main Course',
        isAvailable: true,
        isInStock: true,
        preparationTime: 15,
        images: [],
      });
      setShowAddModal(false);
      Alert.alert('Success', 'Menu item updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update menu item. Please try again.');
    }
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, we would call a delete function from the context
            setMenuItems(menuItems.filter(item => item.id !== id));
            Alert.alert('Success', 'Menu item deleted successfully!');
          },
        },
      ]
    );
  };

  const toggleStock = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id
        ? { ...item, isInStock: !item.isInStock }
        : item
    ));
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id
        ? { ...item, isAvailable: !item.isAvailable }
        : item
    ));
  };

  const renderMenuItem = (item: MenuItem) => (
    <Card key={item.id} style={styles.menuItem}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={[globalStyles.h5, styles.itemName]}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        </View>
        <View style={styles.itemActions}>
          <Text style={[globalStyles.h4, styles.itemPrice]}>GH₵{item.price.toFixed(2)}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => handleEditItem(item)}
            >
              <Ionicons name="pencil" size={16} color={theme.colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDeleteItem(item.id)}
            >
              <Ionicons name="trash" size={16} color={theme.colors.error[500]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Image Preview */}
      {item.images && item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
          {item.images.slice(0, 3).map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.itemImagePreview}
            />
          ))}
          {item.images.length > 3 && (
            <View style={[styles.itemImagePreview, styles.moreImagesOverlay]}>
              <Text style={styles.moreImagesText}>+{item.images.length - 3}</Text>
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.itemControls}>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>In Stock</Text>
          <Switch
            value={item.isInStock}
            onValueChange={() => toggleStock(item.id)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.success[500] + '40' }}
            thumbColor={item.isInStock ? theme.colors.success[500] : theme.colors.neutral[400]}
          />
        </View>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Available</Text>
          <Switch
            value={item.isAvailable}
            onValueChange={() => toggleAvailability(item.id)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
            thumbColor={item.isAvailable ? theme.colors.primary[500] : theme.colors.neutral[400]}
          />
        </View>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Prep Time: {item.preparationTime} min</Text>
          <View style={[styles.statusBadge, 
            !item.isInStock ? styles.outOfStock : 
            !item.isAvailable ? styles.unavailable : styles.available
          ]}>
            <Text style={styles.statusText}>
              {!item.isInStock ? 'Out of Stock' : 
               !item.isAvailable ? 'Unavailable' : 'Available'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderAddEditModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => {
              setShowAddModal(false);
              setEditingItem(null);
              setNewItem({
                name: '',
                description: '',
                price: 0,
                category: 'Main Course',
                isAvailable: true,
                isInStock: true,
                preparationTime: 15,
                images: [],
              });
            }}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[globalStyles.h3, styles.modalTitle]}>
            {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <Input
            label="Item Name *"
            placeholder="Enter item name"
            value={newItem.name || ''}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
          />

          <Input
            label="Description *"
            placeholder="Enter item description"
            value={newItem.description || ''}
            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Price (GH₵) *"
            placeholder="0.00"
            value={newItem.price?.toString() || ''}
            onChangeText={(text) => setNewItem({ ...newItem, price: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />

          <Input
            label="Category"
            placeholder="Main Course"
            value={newItem.category || ''}
            onChangeText={(text) => setNewItem({ ...newItem, category: text })}
          />

          <Input
            label="Preparation Time (minutes)"
            placeholder="15"
            value={newItem.preparationTime?.toString() || ''}
            onChangeText={(text) => setNewItem({ ...newItem, preparationTime: parseInt(text) || 15 })}
            keyboardType="numeric"
          />

          {/* Image Upload Component */}
          <ImageUpload
            onImagesUploaded={handleImagesUploaded}
            maxImages={3}
            allowMultiple={true}
            title="Item Images"
            subtitle="Add photos of this menu item"
            existingImages={newItem.images || []}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Available</Text>
            <Switch
              value={newItem.isAvailable ?? true}
              onValueChange={(value) => setNewItem({ ...newItem, isAvailable: value })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>In Stock</Text>
            <Switch
              value={newItem.isInStock ?? true}
              onValueChange={(value) => setNewItem({ ...newItem, isInStock: value })}
            />
          </View>

          <Button
            title={editingItem ? 'Update Item' : 'Add Item'}
            onPress={editingItem ? handleUpdateItem : handleAddItem}
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
            <Text style={[globalStyles.h3, { color: theme.colors.primary[500] }]}>{menuItems.length}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: theme.colors.success[500] }]}>
              {menuItems.filter(item => item.isInStock).length}
            </Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[globalStyles.h3, { color: theme.colors.error[500] }]}>
              {menuItems.filter(item => !item.isInStock).length}
            </Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </Card>
        </View>

        <View style={styles.menuList}>
          {menuItems.map(renderMenuItem)}
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
    backgroundColor: theme.colors.secondary[500],
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
  
  menuList: {
    paddingBottom: theme.spacing.xl,
  },
  
  menuItem: {
    marginBottom: theme.spacing.md,
  },
  
  itemHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  
  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  
  itemName: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  itemCategory: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing.xs,
  },
  
  itemDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  
  itemActions: {
    alignItems: 'flex-end',
  },
  
  itemPrice: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
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
  
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  
  itemImagePreview: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  
  moreImagesOverlay: {
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  moreImagesText: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  itemControls: {
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
  
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  
  available: {
    backgroundColor: theme.colors.success[50],
  },
  
  unavailable: {
    backgroundColor: theme.colors.warning[50],
  },
  
  outOfStock: {
    backgroundColor: theme.colors.error[50],
  },
  
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
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

export default RestaurantMenuManagementScreen;