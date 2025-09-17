import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components';
import { globalStyles } from '../../styles/globalStyles';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useRestaurant } from '../../contexts/RestaurantContext';

import { useNavigation } from '@react-navigation/native';

const RestaurantDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { getMyRestaurants, getMyOrders, getMyMenuItems, restaurants, orders, menuItems } = useRestaurant();

  const navigation = useNavigation();
  const [todayStats, setTodayStats] = useState({
    orders: 0,
    revenue: 0,
    menuItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load restaurants, orders, and menu items
      await Promise.all([
        getMyRestaurants(),
        getMyOrders(),
        getMyMenuItems()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Calculate today's stats when data changes
    calculateTodayStats();
  }, [restaurants, orders, menuItems]);

  const calculateTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate orders for today
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime() && 
             order.status !== 'cancelled';
    });
    
    const orderCount = todayOrders.length;
    
    // Calculate revenue for today
    const revenue = todayOrders.reduce((total, order) => total + order.totalPrice, 0);
    
    // Count menu items
    const menuItemCount = menuItems.length;
    
    setTodayStats({
      orders: orderCount,
      revenue,
      menuItems: menuItemCount
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[globalStyles.bodyLarge, { color: theme.colors.text.primary }]}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.colors.background.primary }]}>
          <View style={styles.welcomeSection}>
            <Text style={[globalStyles.h2, styles.greeting, { color: theme.colors.text.primary }]}>Welcome, {user?.name}! 🍽️</Text>
            <Text style={[globalStyles.bodyLarge, styles.subtitle, { color: theme.colors.text.secondary }]}>Manage your restaurant business</Text>
          </View>
          
          <View style={styles.restaurantIcon}>
            <Ionicons name="restaurant" size={48} color={theme.colors.secondary[500]} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[globalStyles.h4, styles.sectionTitle, { color: theme.colors.text.primary }]}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.primary[500], backgroundColor: theme.colors.background.primary }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.primary[500] }]}>{todayStats.orders}</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel, { color: theme.colors.text.secondary }]}>Orders</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.secondary[500], backgroundColor: theme.colors.background.primary }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.secondary[500] }]}>₵{todayStats.revenue.toFixed(2)}</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel, { color: theme.colors.text.secondary }]}>Revenue</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.success[500], backgroundColor: theme.colors.background.primary }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.success[500] }]}>{todayStats.menuItems}</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel, { color: theme.colors.text.secondary }]}>Menu Items</Text>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle, { color: theme.colors.text.primary }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.background.primary }]}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Menu');
              }}
            >
              <Ionicons name="restaurant" size={20} color={theme.colors.secondary[500]} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>Manage Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.background.primary }]}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Orders');
              }}
            >
              <Ionicons name="receipt" size={20} color={theme.colors.primary[500]} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.background.primary }]}>
              <Ionicons name="analytics" size={20} color={theme.colors.warning[500]} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.background.primary }]}>
              <Ionicons name="settings" size={20} color={theme.colors.neutral[600]} />
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle, { color: theme.colors.text.primary }]}>Recent Orders</Text>
          <Card style={StyleSheet.flatten([styles.ordersCard, { backgroundColor: theme.colors.background.primary }])}>
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.background.secondary }]}>
                <Ionicons name="receipt-outline" size={48} color={theme.colors.text.tertiary} />
              </View>
              <Text style={[globalStyles.h5, styles.emptyText, { color: theme.colors.text.primary }]}>No recent orders</Text>
              <Text style={[globalStyles.bodySmall, styles.emptySubtext, { color: theme.colors.text.secondary }]}>Customer orders will appear here</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
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
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.background.primary,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
    ...theme.shadows.sm,
  },
  
  welcomeSection: {
    flex: 1,
  },
  
  greeting: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  
  subtitle: {
    color: theme.colors.text.secondary,
  },
  
  restaurantIcon: {
    marginLeft: theme.spacing[4],
  },
  
  themeToggleContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
    paddingTop: theme.spacing[6],
  },
  
  sectionTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 2,
    paddingVertical: theme.spacing[4],
  },
  
  statLabel: {
    marginTop: theme.spacing[1],
    color: theme.colors.text.secondary,
  },
  
  // Sections
  section: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  
  actionButton: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    ...theme.shadows.sm,
  },
  
  actionText: {
    marginLeft: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  
  // Orders Card
  ordersCard: {
    padding: theme.spacing[8],
  },
  
  emptyState: {
    alignItems: 'center',
  },
  
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  
  emptyText: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  
  emptySubtext: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
});

export default RestaurantDashboardScreen;