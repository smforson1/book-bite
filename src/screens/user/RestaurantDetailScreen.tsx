import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, ReviewSummary } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import { useReview } from '../../contexts/ReviewContext';
import { Restaurant, MenuItem } from '../../types';

interface RestaurantDetailScreenProps {
  route: {
    params: {
      restaurant: Restaurant;
    };
  };
  navigation: any;
}

const RestaurantDetailScreen: React.FC<RestaurantDetailScreenProps> = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { user } = useAuth();
  const { 
    getMenuByRestaurantId, 
    addToCart, 
    cart, 
    getCartTotal,
    createOrder,
    clearCart
  } = useRestaurant();
  const { getReviewSummary, canUserReview } = useReview();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCartModal, setShowCartModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const menuItems = useMemo(() => getMenuByRestaurantId(restaurant.id), [restaurant.id]);
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(menuItems.map(item => item.category))];
    return cats;
  }, [menuItems]);
  
  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'All') return menuItems.filter(item => item.isAvailable);
    return menuItems.filter(item => item.category === selectedCategory && item.isAvailable);
  }, [menuItems, selectedCategory]);

  const cartTotal = getCartTotal();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const restaurantCartItems = cart.filter(item => item.restaurantId === restaurant.id);
  const reviewSummary = useMemo(() => getReviewSummary(restaurant.id, 'restaurant'), [restaurant.id]);
  const canWriteReview = user ? canUserReview(user.id, restaurant.id, 'restaurant') : false;

  const handleAddToCart = (menuItem: MenuItem) => {
    if (cart.length > 0 && cart[0].restaurantId !== restaurant.id) {
      Alert.alert(
        'Different Restaurant',
        'You have items from another restaurant in your cart. Clear cart to add items from this restaurant?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear Cart',
            onPress: () => {
              clearCart();
              addToCart({
                menuItemId: menuItem.id,
                restaurantId: restaurant.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1,
              });
            },
          },
        ]
      );
      return;
    }

    addToCart({
      menuItemId: menuItem.id,
      restaurantId: restaurant.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
    });
  };

  const handleOrder = async () => {
    if (!user || restaurantCartItems.length === 0) {
      Alert.alert('Error', 'Please add items to cart and ensure you are logged in.');
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address.');
      return;
    }

    setIsOrdering(true);
    try {
      const orderItems = restaurantCartItems.map(cartItem => ({
        menuItemId: cartItem.menuItemId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        specialInstructions: cartItem.specialInstructions,
      }));

      await createOrder({
        userId: user.id,
        restaurantId: restaurant.id,
        items: orderItems,
        totalPrice: cartTotal + restaurant.deliveryFee,
        deliveryAddress: deliveryAddress.trim(),
        status: 'pending',
        paymentStatus: 'pending',
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
      });

      clearCart();
      setShowCartModal(false);
      
      Alert.alert(
        'Order Placed!',
        `Your order from ${restaurant.name} has been placed successfully. Estimated delivery time: 45 minutes.`,
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('Orders'),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleWriteReview = () => {
    // @ts-ignore - Navigation will be properly typed in actual navigation setup
    navigation.navigate('WriteReview', {
      targetId: restaurant.id,
      targetType: 'restaurant',
      targetName: restaurant.name,
    });
  };

  const handleSeeAllReviews = () => {
    // @ts-ignore - Navigation will be properly typed in actual navigation setup
    navigation.navigate('ReviewsList', {
      targetId: restaurant.id,
      targetType: 'restaurant',
      targetName: restaurant.name,
    });
  };

  const renderCategory = (category: string, index: number) => (
    <TouchableOpacity
      key={index}
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

  const renderMenuItem = (item: MenuItem, index: number) => (
    <Card key={item.id} style={styles.menuItemCard}>
      <View style={styles.menuItemContent}>
        {item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={styles.menuItemImage} />
        )}
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.menuItemDetails}>
            <Text style={styles.preparationTime}>
              <Ionicons name="time-outline" size={14} color={theme.colors.text.tertiary} />
              {' '}{item.preparationTime}
            </Text>
            {item.allergens.length > 0 && (
              <Text style={styles.allergens}>
                <Ionicons name="warning-outline" size={14} color={theme.colors.warning[500]} />
                {' '}Contains: {item.allergens.join(', ')}
              </Text>
            )}
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
            <Button
              title="Add to Cart"
              onPress={() => handleAddToCart(item)}
              style={styles.addButton}
              size="small"
            />
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        {cartItemCount > 0 && (
          <TouchableOpacity style={styles.cartButton} onPress={() => setShowCartModal(true)}>
            <Ionicons name="bag" size={24} color={theme.colors.primary[500]} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Image source={{ uri: restaurant.images[0] }} style={styles.restaurantImage} />
          <View style={styles.restaurantDetails}>
            <View style={styles.ratingRow}>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color={theme.colors.warning[500]} />
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
              </View>
              <Text style={styles.cuisineText}>{restaurant.cuisine.join(', ')}</Text>
            </View>
            <Text style={styles.description}>{restaurant.description}</Text>
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryItem}>
                <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.deliveryText}>{restaurant.deliveryTime}</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="car" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.deliveryText}>${restaurant.deliveryFee.toFixed(2)} delivery</Text>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="card" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.deliveryText}>${restaurant.minimumOrder} min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <ReviewSummary
          summary={reviewSummary}
          canWriteReview={canWriteReview}
          onWriteReviewPress={handleWriteReview}
          onSeeAllReviewsPress={handleSeeAllReviews}
        />

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {categories.map(renderCategory)}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={[globalStyles.h3, styles.sectionTitle]}>Menu</Text>
          {filteredMenuItems.map(renderMenuItem)}
          {filteredMenuItems.length === 0 && (
            <Text style={styles.noItemsText}>
              No items available in {selectedCategory === 'All' ? 'this restaurant' : selectedCategory}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Cart Modal */}
      <Modal
        visible={showCartModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Order</Text>
            <TouchableOpacity onPress={() => setShowCartModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {restaurantCartItems.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <View style={styles.cartItemRow}>
                  <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} x {item.quantity}</Text>
                  <Text style={styles.cartItemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            ))}
            
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>${restaurant.deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${(cartTotal + restaurant.deliveryFee).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Delivery Address</Text>
              <Input
                placeholder="Enter your delivery address"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                style={styles.addressInput}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={isOrdering ? "Placing Order..." : "Place Order"}
              onPress={handleOrder}
              disabled={isOrdering || cartTotal < restaurant.minimumOrder}
              style={styles.orderButton}
            />
            {cartTotal < restaurant.minimumOrder && (
              <Text style={styles.minimumOrderText}>
                Minimum order: ${restaurant.minimumOrder.toFixed(2)}
              </Text>
            )}
          </View>
        </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.md,
  },
  cartButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.danger[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold as '700',
  },
  content: {
    flex: 1,
  },
  restaurantInfo: {
    padding: theme.spacing.lg,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  restaurantDetails: {
    marginBottom: theme.spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
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
  cuisineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  categoriesSection: {
    marginBottom: theme.spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  selectedCategoryText: {
    color: theme.colors.neutral[0],
  },
  menuSection: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  menuItemCard: {
    marginBottom: theme.spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  menuItemDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  menuItemDetails: {
    marginBottom: theme.spacing.sm,
  },
  preparationTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  allergens: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.warning[600],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.primary[500],
  },
  addButton: {
    minWidth: 100,
  },
  noItemsText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    padding: theme.spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  cartItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  cartItemName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  cartItemTotal: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  orderSummary: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
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
  addressSection: {
    marginTop: theme.spacing.lg,
  },
  addressLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  addressInput: {
    marginBottom: theme.spacing.md,
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  orderButton: {
    marginBottom: theme.spacing.sm,
  },
  minimumOrderText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[600],
  },
});

export default RestaurantDetailScreen;