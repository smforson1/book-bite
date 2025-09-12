import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Order, MenuItem } from '../../types';

export type OrdersStackParamList = {
  Orders: undefined;
  Payment: {
    amount: number;
    currency: string;
    paymentFor: 'booking' | 'order';
    referenceId: string;
  };
  PaymentConfirmation: {
    amount: number;
    currency: string;
    paymentFor: 'booking' | 'order';
    referenceId: string;
    paymentMethod: string;
    transactionId: string;
  };
};

const OrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const { orders, getRestaurantById, getMenuItemById, updateOrderStatus } = useRestaurant();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<StackNavigationProp<OrdersStackParamList, 'Orders'>>();

  useEffect(() => {
    if (user) {
      const filtered = orders.filter(order => order.userId === user.id);
      setUserOrders(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, [orders, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refetch from server
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, 'cancelled');
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success[500];
      case 'pending':
        return theme.colors.warning[500];
      case 'delivered':
        return theme.colors.info[500];
      case 'cancelled':
        return theme.colors.danger[500];
      case 'preparing':
        return theme.colors.primary[500];
      case 'ready':
        return theme.colors.secondary[500];
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'delivered':
        return 'car';
      case 'cancelled':
        return 'close-circle';
      case 'preparing':
        return 'restaurant';
      case 'ready':
        return 'checkmark';
      default:
        return 'help-circle';
    }
  };

  const renderOrder = ({ item: order }: { item: Order }) => {
    const restaurant = getRestaurantById(order.restaurantId);
    if (!restaurant) return null;

    const canCancel = order.status === 'pending' || order.status === 'confirmed';
    const canPay = order.status === 'pending' || (order.status === 'confirmed' && !order.paymentStatus);

    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>n            <Ionicons 
              name={getStatusIcon(order.status)} 
              size={14} 
              color={getStatusColor(order.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>n              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.itemsSection}>
          {order.items.map((item, index) => {
            const menuItem = getMenuItemById(item.menuItemId);
            if (!menuItem) return null;
            return (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{menuItem.name}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.deliverySection}>
          <View style={styles.deliveryItem}>
            <Ionicons name="location" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.deliveryText}>{order.deliveryAddress}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.deliveryText}>
              {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Subtotal:</Text>
            <Text style={styles.paymentValue}>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Delivery Fee:</Text>
            <Text style={styles.paymentValue}>${restaurant.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>${order.totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status:</Text>
            <Text style={[
              styles.paymentStatus,
              { color: order.paymentStatus === 'paid' ? theme.colors.success[500] : theme.colors.warning[500] }
            ]}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</Text>
          </View>
        </View>

        {canCancel && (
          <View style={styles.actionRow}>
            <Button
              title="Cancel Order"
              variant="outline"
              onPress={() => handleCancelOrder(order)}
              style={styles.cancelButton}
            />
          </View>
        )}
        
        {canPay && (
          <View style={styles.actionRow}>
            <Button
              title="Pay Now"
              onPress={() => {
                navigation.navigate('Payment', {
                  amount: order.totalPrice,
                  currency: 'USD',
                  paymentFor: 'order',
                  referenceId: order.id
                });
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
      <Ionicons name="receipt-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        When you order food, your orders will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={userOrders}
        renderItem={renderOrder}
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
  orderCard: {
    marginBottom: theme.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  restaurantName: {
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
  itemsSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  itemQuantity: {
    width: 30,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.sm,
  },
  itemPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  deliverySection: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  deliveryText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  paymentSection: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  paymentLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  paymentValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.xs,
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
  paymentStatus: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  orderDate: {
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
  payButton: {
    borderColor: theme.colors.success[500],
    backgroundColor: theme.colors.success[500],
    color: theme.colors.neutral[0],
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
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
});

export default OrdersScreen;