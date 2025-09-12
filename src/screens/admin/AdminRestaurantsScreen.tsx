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
  Image,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import { Restaurant, MenuItem } from '../../types';

const AdminRestaurantsScreen: React.FC = () => {
  const { user } = useAuth();
  const { 
    restaurants, 
    getMenuByRestaurantId,
    updateMenuItemPrice,
    toggleMenuItemAvailability
  } = useRestaurant();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedCategory('All');
    setShowMenuModal(true);
  };

  const handleEditPrice = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setNewPrice(menuItem.price.toString());
    setShowPriceModal(true);
  };

  const handleUpdatePrice = async () => {
    if (!selectedMenuItem || !newPrice) return;
    
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setIsUpdating(true);
    try {
      await updateMenuItemPrice(selectedMenuItem.id, price);
      setShowPriceModal(false);
      setSelectedMenuItem(null);
      setNewPrice('');
      Alert.alert('Success', 'Menu item price updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update menu item price');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAvailability = async (menuItem: MenuItem) => {
    try {
      await toggleMenuItemAvailability(menuItem.id);
      Alert.alert(
        'Success', 
        `${menuItem.name} is now ${menuItem.isAvailable ? 'unavailable' : 'available'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update menu item availability');
    }
  };

  const getMenuItems = () => {
    if (!selectedRestaurant) return [];
    const menuItems = getMenuByRestaurantId(selectedRestaurant.id);
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  };

  const getCategories = () => {
    if (!selectedRestaurant) return ['All'];
    const menuItems = getMenuByRestaurantId(selectedRestaurant.id);
    const categories = ['All', ...new Set(menuItems.map(item => item.category))];
    return categories;
  };

  const renderRestaurant = ({ item: restaurant }: { item: Restaurant }) => {
    const menuItems = getMenuByRestaurantId(restaurant.id);
    const avgPrice = menuItems.length > 0 
      ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length
      : 0;
    const availableItems = menuItems.filter(item => item.isAvailable).length;

    return (
      <Card style={styles.restaurantCard}>
        <View style={styles.restaurantHeader}>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantLocation}>
              <Ionicons name="location-outline" size={14} color={theme.colors.text.tertiary} />
              {' '}{restaurant.address}
            </Text>
            <View style={styles.restaurantStats}>
              <Text style={styles.statText}>{menuItems.length} items</Text>
              <Text style={styles.statText}>{availableItems} available</Text>
              <Text style={styles.statText}>Avg: ${avgPrice.toFixed(2)}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={theme.colors.warning[500]} />
                <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewMenuButton}
            onPress={() => handleViewMenu(restaurant)}
          >
            <Ionicons name="restaurant-outline" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.viewMenuText}>Manage Menu</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === category && styles.selectedCategoryText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item: menuItem }: { item: MenuItem }) => {
    const cardStyles: ViewStyle = !menuItem.isAvailable 
      ? { ...styles.menuItemCard, ...styles.unavailableItem }
      : styles.menuItemCard;
      
    return (
      <Card style={cardStyles}>
      <View style={styles.menuItemHeader}>
        <View style={styles.menuItemInfo}>
          {menuItem.images.length > 0 && (
            <Image source={{ uri: menuItem.images[0] }} style={styles.menuItemImage} />
          )}
          <View style={styles.menuItemDetails}>
            <Text style={styles.menuItemName}>{menuItem.name}</Text>
            <Text style={styles.menuItemDescription} numberOfLines={2}>
              {menuItem.description}
            </Text>
            <View style={styles.menuItemMeta}>
              <Text style={styles.menuItemPrice}>${menuItem.price.toFixed(2)}</Text>
              <Text style={styles.preparationTime}>
                <Ionicons name="time-outline" size={12} color={theme.colors.text.tertiary} />
                {' '}{menuItem.preparationTime}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.menuItemActions}>
          <TouchableOpacity
            style={styles.editPriceButton}
            onPress={() => handleEditPrice(menuItem)}
          >
            <Ionicons name="create-outline" size={16} color={theme.colors.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.availabilityButton,
              !menuItem.isAvailable && styles.unavailableButton
            ]}
            onPress={() => handleToggleAvailability(menuItem)}
          >
            <Ionicons 
              name={menuItem.isAvailable ? "eye" : "eye-off"} 
              size={16} 
              color={menuItem.isAvailable ? theme.colors.success[500] : theme.colors.neutral[400]} 
            />
          </TouchableOpacity>
        </View>
      </View>
      {!menuItem.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </Card>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurant Management</Text>
        <Text style={styles.subtitle}>Manage restaurants and menu pricing</Text>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Menu Management Modal */}
      <Modal
        visible={showMenuModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowMenuModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedRestaurant?.name} - Menu
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Category Filter */}
          <View style={styles.categoriesContainer}>
            <FlatList
              data={getCategories()}
              renderItem={({ item }) => renderCategory(item)}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
          
          <FlatList
            data={getMenuItems()}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.menuList}
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
            <Text style={styles.priceModalTitle}>Edit Menu Item Price</Text>
            <Text style={styles.menuItemNameText}>{selectedMenuItem?.name}</Text>
            
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Price ($)</Text>
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
                  setSelectedMenuItem(null);
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
  restaurantCard: {
    marginBottom: theme.spacing.md,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  restaurantName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  restaurantLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  restaurantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
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
  viewMenuButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
  },
  viewMenuText: {
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
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary[500],
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedCategoryText: {
    color: theme.colors.neutral[0],
  },
  menuList: {
    padding: theme.spacing.md,
  },
  menuItemCard: {
    marginBottom: theme.spacing.md,
  },
  unavailableItem: {
    opacity: 0.7,
    backgroundColor: theme.colors.neutral[50],
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItemInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  menuItemDetails: {
    flex: 1,
  },
  menuItemName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  menuItemDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuItemPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
  },
  preparationTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  menuItemActions: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  editPriceButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  availabilityButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.success[50],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  unavailableButton: {
    backgroundColor: theme.colors.neutral[100],
  },
  unavailableBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.error[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  unavailableText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.fontWeight.medium,
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
  menuItemNameText: {
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

export default AdminRestaurantsScreen;