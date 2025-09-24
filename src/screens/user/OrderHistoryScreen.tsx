import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { theme } from '../../styles/theme';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import { Order, MenuItem } from '../../types';

const OrderHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const { orders, getRestaurantById, getMenuItemById } = useRestaurant();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    if (user) {
      const filtered = orders.filter(order => order.userId === user.id);
      setUserOrders(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, [orders, user]);

  useEffect(() => {
    // Apply filter based on selected filter
    switch (filter) {
      case 'active':
        setFilteredOrders(userOrders.filter(order =>
          ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(order.status)
        ));
        break;
      case 'delivered':
        setFilteredOrders(userOrders.filter(order => order.status === 'delivered'));
        break;
      case 'cancelled':
        setFilteredOrders(userOrders.filter(order => order.status === 'cancelled'));
        break;
      default:
        setFilteredOrders(userOrders);
    }
  }, [userOrders, filter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refetch from server
    setTimeout(() => setRefreshing(false), 1000);
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
      case 'picked_up':
        return theme.colors.info[500];
      case 'on_the_way':
        return theme.colors.info[500];
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
      case 'picked_up':
        return 'bicycle';
      case 'on_the_way':
        return 'navigate';
      default:
        return 'help-circle';
    }
  };

  const renderOrder = (order: Order) => {
    const restaurant = getRestaurantById(order.restaurantId);
    if (!restaurant) return null;

    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Ionicons
              name={getStatusIcon(order.status)}
              size={14}
              color={getStatusColor(order.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                <Text style={styles.itemPrice}>GH₵{(item.price * item.quantity).toFixed(2)}</Text>
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
            <Text style={styles.paymentValue}>GH₵{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Delivery Fee:</Text>
            <Text style={styles.paymentValue}>GH₵{restaurant.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>GH₵{order.totalPrice.toFixed(2)}</Text>
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

        <Text style={styles.orderDate}>
          Ordered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No Orders Found</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all'
          ? 'You have no order history yet.'
          : `You have no ${filter} orders.`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.activeFilterTab]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'delivered' && styles.activeFilterTab]}
          onPress={() => setFilter('delivered')}
        >
          <Text style={[styles.filterText, filter === 'delivered' && styles.activeFilterText]}>Delivered</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'cancelled' && styles.activeFilterTab]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.activeFilterText]}>Cancelled</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <View key={order.id}>
              {renderOrder(order)}
            </View>
          ))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
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
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.neutral[200],
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary[500],
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  activeFilterText: {
    color: theme.colors.neutral[0],
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: 0,
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
    textAlign: 'right',
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

export default OrderHistoryScreen;