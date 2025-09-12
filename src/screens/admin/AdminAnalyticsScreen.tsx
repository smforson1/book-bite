import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useHotel } from '../../contexts/HotelContext';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import { Hotel, Room, Booking, Restaurant, MenuItem, Order } from '../../types';

const AdminAnalyticsScreen: React.FC = () => {
  const { user } = useAuth();
  const { hotels, bookings } = useHotel();
  const { restaurants, orders, menuItems } = useRestaurant();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'restaurants'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate date range
  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  };

  // Filter data based on date range
  const filteredBookings = bookings.filter(
    booking => new Date(booking.createdAt) >= getDateRange(dateRange)
  );
  
  const filteredOrders = orders.filter(
    order => new Date(order.createdAt) >= getDateRange(dateRange)
  );

  // Calculate statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalBookings = filteredBookings.length;
  const totalOrders = filteredOrders.length;
  const avgBookingValue = totalBookings > 0 ? filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0) / totalBookings : 0;
  const avgOrderValue = totalOrders > 0 ? filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0) / totalOrders : 0;
  const totalUsers = new Set([...bookings.map(b => b.userId), ...orders.map(o => o.userId)]).size;

  // Calculate daily statistics for charts
  const dailyStats = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayBookings = filteredBookings.filter(
      b => new Date(b.createdAt).toISOString().split('T')[0] === dateStr
    );
    const dayOrders = filteredOrders.filter(
      o => new Date(o.createdAt).toISOString().split('T')[0] === dateStr
    );
    
    return {
      date: dateStr,
      bookings: dayBookings.length,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
    };
  }).reverse();

  // Calculate top performers
  const hotelRevenue = hotels.map(hotel => ({
    hotel,
    revenue: filteredBookings
      .filter(b => b.hotelId === hotel.id)
      .reduce((sum, b) => sum + b.totalPrice, 0),
    bookings: filteredBookings.filter(b => b.hotelId === hotel.id).length,
  })).sort((a, b) => b.revenue - a.revenue);

  const restaurantRevenue = restaurants.map(restaurant => ({
    restaurant,
    revenue: filteredOrders
      .filter(o => o.restaurantId === restaurant.id)
      .reduce((sum, o) => sum + o.totalPrice, 0),
    orders: filteredOrders.filter(o => o.restaurantId === restaurant.id).length,
  })).sort((a, b) => b.revenue - a.revenue);

  const topMenuItem = menuItems.map(item => ({
    item,
    revenue: filteredOrders
      .flatMap(order => order.items)
      .filter(orderItem => orderItem.menuItemId === item.id)
      .reduce((sum, orderItem) => sum + (orderItem.price * orderItem.quantity), 0),
    count: filteredOrders
      .flatMap(order => order.items)
      .filter(orderItem => orderItem.menuItemId === item.id)
      .reduce((sum, orderItem) => sum + orderItem.quantity, 0),
  })).sort((a, b) => b.revenue - a.revenue)[0];

  // Render functions
  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statTitle}>Total Revenue</Text>
            <Ionicons name="cash-outline" size={24} color={theme.colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>${totalRevenue.toFixed(2)}</Text>
          <Text style={styles.statChange}>+12.5% from last period</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statTitle}>Total Bookings</Text>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>{totalBookings}</Text>
          <Text style={styles.statChange}>+8.2% from last period</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statTitle}>Total Orders</Text>
            <Ionicons name="receipt-outline" size={24} color={theme.colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>{totalOrders}</Text>
          <Text style={styles.statChange}>+15.7% from last period</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={styles.statTitle}>Active Users</Text>
            <Ionicons name="people-outline" size={24} color={theme.colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>{totalUsers}</Text>
          <Text style={styles.statChange}>+23 from last period</Text>
        </Card>
      </View>
      
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Daily Performance</Text>
          <View style={styles.dateRangeSelector}>
            <TouchableOpacity
              style={[styles.dateRangeButton, dateRange === '7d' && styles.dateRangeButtonActive]}
              onPress={() => setDateRange('7d')}
            >
              <Text style={styles.dateRangeText}>7D</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateRangeButton, dateRange === '30d' && styles.dateRangeButtonActive]}
              onPress={() => setDateRange('30d')}
            >
              <Text style={styles.dateRangeText}>30D</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateRangeButton, dateRange === '90d' && styles.dateRangeButtonActive]}
              onPress={() => setDateRange('90d')}
            >
              <Text style={styles.dateRangeText}>90D</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateRangeButton, dateRange === 'all' && styles.dateRangeButtonActive]}
              onPress={() => setDateRange('all')}
            >
              <Text style={styles.dateRangeText}>All</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          {/* Placeholder for chart - you can implement a proper chart library */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Chart visualization would go here</Text>
            <Text style={styles.chartPlaceholderSubtext}>Daily performance data over {dateRange}</Text>
          </View>
        </View>
      </Card>
      
      <View style={styles.comparisonContainer}>
        <Card style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Bookings vs Orders</Text>
          <View style={styles.comparisonStats}>
            <View style={styles.comparisonStat}>
              <Text style={styles.comparisonLabel}>Avg. Booking Value</Text>
              <Text style={styles.comparisonValue}>${avgBookingValue.toFixed(2)}</Text>
            </View>
            <View style={styles.comparisonStat}>
              <Text style={styles.comparisonLabel}>Avg. Order Value</Text>
              <Text style={styles.comparisonValue}>${avgOrderValue.toFixed(2)}</Text>
            </View>
          </View>
        </Card>
      </View>
      
      <View style={styles.topPerformersContainer}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        <View style={styles.topPerformers}>
          <Card style={styles.topPerformerCard}>
            <Text style={styles.topPerformerTitle}>Top Hotel</Text>
            <Text style={styles.topPerformerName}>{hotels[0]?.name || 'N/A'}</Text>
            <Text style={styles.topPerformerValue}>${filteredBookings
              .filter(b => b.hotelId === hotels[0]?.id)
              .reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2)} earned</Text>
          </Card>
          
          <Card style={styles.topPerformerCard}>
            <Text style={styles.topPerformerTitle}>Top Restaurant</Text>
            <Text style={styles.topPerformerName}>{restaurants[0]?.name || 'N/A'}</Text>
            <Text style={styles.topPerformerValue}>${filteredOrders
              .filter(o => o.restaurantId === restaurants[0]?.id)
              .reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)} earned</Text>
          </Card>
        </View>
        
        <Card style={styles.topMenuItemCard}>
          <Text style={styles.topMenuItemTitle}>Top Menu Item</Text>
          <Text style={styles.topMenuItemName}>{topMenuItem?.item.name || 'N/A'}</Text>
          <Text style={styles.topMenuItemValue}>{topMenuItem?.count || 0} sold • ${topMenuItem?.revenue.toFixed(2) || 0} earned</Text>
        </Card>
      </View>
    </View>
  );
  
  const renderHotels = () => {
    if (!selectedHotel) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Hotel Performance</Text>
          <FlatList
            data={hotelRevenue}
            renderItem={({ item }) => (
              <Card style={styles.hotelPerformanceCard}>
                <View style={styles.performanceHeader}>
                  <Text style={styles.performanceName}>{item.hotel.name}</Text>
                  <Text style={styles.performanceValue}>${item.revenue.toFixed(2)}</Text>
                </View>
                <View style={styles.performanceDetails}>
                  <Text style={styles.performanceSubValue}>{item.bookings} bookings</Text>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => {
                      setSelectedHotel(item.hotel);
                      setShowDetails(true);
                    }}
                  >
                    <Ionicons name="arrow-forward" size={18} color={theme.colors.primary[500]} />
                  </TouchableOpacity>
                </View>
              </Card>
            )}
            keyExtractor={(item) => item.hotel.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }
    
    // Show hotel details
    const hotelStats = {
      totalRevenue: filteredBookings
        .filter(b => b.hotelId === selectedHotel.id)
        .reduce((sum, b) => sum + b.totalPrice, 0),
      totalBookings: filteredBookings.filter(b => b.hotelId === selectedHotel.id).length,
      avgBookingValue: filteredBookings
        .filter(b => b.hotelId === selectedHotel.id)
        .reduce((sum, b) => sum + b.totalPrice, 0) / (filteredBookings.filter(b => b.hotelId === selectedHotel.id).length || 1),
      rooms: useHotel().getRoomsByHotelId(selectedHotel.id).map((room: Room) => {
        return {
          room,
          bookings: filteredBookings.filter(b => b.roomId === room.id).length,
          revenue: filteredBookings
            .filter(b => b.roomId === room.id)
            .reduce((sum, b) => sum + b.totalPrice, 0),
        };
      }),
    };
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedHotel(null);
              setShowDetails(false);
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{selectedHotel.name}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setSelectedHotel(null);
              setShowDetails(false);
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailStatsContainer}>
          <Card style={styles.detailStatCard}>
            <Text style={styles.detailStatLabel}>Total Revenue</Text>
            <Text style={styles.detailStatValue}>${hotelStats.totalRevenue.toFixed(2)}</Text>
          </Card>
          
          <Card style={styles.detailStatCard}>
            <Text style={styles.detailStatLabel}>Total Bookings</Text>
            <Text style={styles.detailStatValue}>{hotelStats.totalBookings}</Text>
          </Card>
          
          <Card style={styles.detailStatCard}>
            <Text style={styles.detailStatLabel}>Avg. Booking Value</Text>
            <Text style={styles.detailStatValue}>${hotelStats.avgBookingValue.toFixed(2)}</Text>
          </Card>
        </View>
        
        <Text style={styles.sectionTitle}>Room Performance</Text>
        <FlatList
          data={hotelStats.rooms}
          renderItem={({ item }) => (
            <Card style={styles.roomPerformanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceName}>{item.room?.type || 'Room'}</Text>
                <Text style={styles.performanceValue}>${item.revenue.toFixed(2)}</Text>
              </View>
              <View style={styles.performanceDetails}>
                <Text style={styles.performanceSubValue}>{item.bookings} bookings</Text>
                <Text style={styles.performanceSubValue}>{item.room?.price ? `$${item.room.price}/night` : 'N/A'}</Text>
              </View>
            </Card>
          )}
          keyExtractor={(item) => item.room?.id || 'unknown'}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  
  const renderRestaurants = () => {
    if (!selectedRestaurant) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Restaurant Performance</Text>
          <FlatList
            data={restaurantRevenue}
            renderItem={({ item }) => (
              <Card style={styles.hotelPerformanceCard}>
                <View style={styles.performanceHeader}>
                  <Text style={styles.performanceName}>{item.restaurant.name}</Text>
                  <Text style={styles.performanceValue}>${item.revenue.toFixed(2)}</Text>
                </View>
                <View style={styles.performanceDetails}>
                  <Text style={styles.performanceSubValue}>{item.orders} orders</Text>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => {
                      setSelectedRestaurant(item.restaurant);
                      setShowDetails(true);
                    }}
                  >
                    <Ionicons name="arrow-forward" size={18} color={theme.colors.primary[500]} />
                  </TouchableOpacity>
                </View>
              </Card>
            )}
            keyExtractor={(item) => item.restaurant.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }
    
    // Show restaurant details
    const restaurantStats = {
      totalRevenue: filteredOrders
        .filter(o => o.restaurantId === selectedRestaurant.id)
        .reduce((sum, o) => sum + o.totalPrice, 0),
      totalOrders: filteredOrders.filter(o => o.restaurantId === selectedRestaurant.id).length,
      avgOrderValue: filteredOrders
        .filter(o => o.restaurantId === selectedRestaurant.id)
        .reduce((sum, o) => sum + o.totalPrice, 0) / (filteredOrders.filter(o => o.restaurantId === selectedRestaurant.id).length || 1),
      menuPerformance: menuItems.map(item => ({
        item,
        revenue: filteredOrders
          .filter(o => o.restaurantId === selectedRestaurant.id)
          .flatMap(order => order.items)
          .filter(orderItem => orderItem.menuItemId === item.id)
          .reduce((sum, orderItem) => sum + (orderItem.price * orderItem.quantity), 0),
        count: filteredOrders
          .filter(o => o.restaurantId === selectedRestaurant.id)
          .flatMap(order => order.items)
          .filter(orderItem => orderItem.menuItemId === item.id)
          .reduce((sum, orderItem) => sum + orderItem.quantity, 0),
      })).filter(item => item.revenue > 0).sort((a, b) => b.revenue - a.revenue),
    };
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedRestaurant(null);
              setShowDetails(false);
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{selectedRestaurant.name}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setSelectedRestaurant(null);
              setShowDetails(false);
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailStatsContainer}>
          <Card style={styles.detailStatCard}>
            <Text style={styles.detailStatLabel}>Total Revenue</Text>
            <Text style={styles.detailStatValue}>${restaurantStats.totalRevenue.toFixed(2)}</Text>
          </Card>
          
          <Card style={styles.detailStatCard}>
            <Text style={styles.detailStatLabel}>Total Orders</Text>
            <Text style={styles.detailStatValue}>{restaurantStats.totalOrders}</Text>
          </Card>
          
          <Card style={styles.detailStatCard}>
            <Text style={styles.detailStatLabel}>Avg. Order Value</Text>
            <Text style={styles.detailStatValue}>${restaurantStats.avgOrderValue.toFixed(2)}</Text>
          </Card>
        </View>
        
        <Text style={styles.sectionTitle}>Menu Performance</Text>
        <FlatList
          data={restaurantStats.menuPerformance}
          renderItem={({ item }) => (
            <Card style={styles.roomPerformanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceName}>{item.item.name}</Text>
                <Text style={styles.performanceValue}>${item.revenue.toFixed(2)}</Text>
              </View>
              <View style={styles.performanceDetails}>
                <Text style={styles.performanceSubValue}>{item.count} sold</Text>
                <Text style={styles.performanceSubValue}>${item.item.price.toFixed(2)}</Text>
              </View>
            </Card>
          )}
          keyExtractor={(item) => item.item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Monitor platform performance and business insights</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={styles.tabButtonText}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'hotels' && styles.tabButtonActive]}
          onPress={() => setActiveTab('hotels')}
        >
          <Text style={styles.tabButtonText}>Hotels</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'restaurants' && styles.tabButtonActive]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text style={styles.tabButtonText}>Restaurants</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'hotels' && renderHotels()}
      {activeTab === 'restaurants' && renderRestaurants()}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Data updated in real-time • Last updated: {new Date().toLocaleTimeString()}</Text>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tabButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary[500],
  },
  tabButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tabContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statChange: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success[500],
    marginTop: theme.spacing.xs,
  },
  chartCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  dateRangeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dateRangeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral[100],
  },
  dateRangeButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  dateRangeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  chartContainer: {
    height: 250,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  chartPlaceholderText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  chartPlaceholderSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  comparisonContainer: {
    marginBottom: theme.spacing.lg,
  },
  comparisonCard: {
    padding: theme.spacing.lg,
  },
  comparisonTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginBottom: theme.spacing.md,
  },
  comparisonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonStat: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  comparisonLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  comparisonValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  topPerformersContainer: {
    flex: 1,
  },
  topPerformers: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  topPerformerCard: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
  },
  topPerformerTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  topPerformerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  topPerformerValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  topMenuItemCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
  },
  topMenuItemTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  topMenuItemName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  topMenuItemValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  hotelPerformanceCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  performanceName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  performanceValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[500],
  },
  performanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceSubValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  viewDetailsButton: {
    padding: theme.spacing.sm,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  detailTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  detailStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  detailStatCard: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  detailStatValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  roomPerformanceCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default AdminAnalyticsScreen;