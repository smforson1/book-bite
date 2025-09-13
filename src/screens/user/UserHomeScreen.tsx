import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  Button, 
  Card, 
  ActionCard, 
  Header,
  Section,
  LoadingState,
  ListItem
} from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// UserHomeScreen component with enhanced UI

const UserHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleBookHotel = () => {
    // @ts-ignore
    navigation.navigate('Hotels');
  };

  const handleOrderFood = () => {
    // @ts-ignore
    navigation.navigate('Restaurants');
  };

  const handleViewBookings = () => {
    // @ts-ignore
    navigation.navigate('Bookings');
  };

  const handleViewOrders = () => {
    // @ts-ignore
    navigation.navigate('Orders');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {/* Enhanced Header */}
        <Header
          variant="profile"
          userName={user?.name}
          subtitle="What would you like to do today?"
          showNotifications
          notificationCount={3}
          onNotificationPress={() => {}}
          onProfilePress={() => {
            // @ts-ignore
            navigation.navigate('Profile');
          }}
        />

        <LoadingState loading={loading}>
          {/* Quick Actions Section */}
          <Section 
            title="Quick Actions"
            subtitle="Choose what you'd like to do"
            variant="minimal"
            spacing="xl"
          >
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContainer}
              style={styles.quickActionsScroll}
            >
              <ActionCard
                variant="gradient"
                style={styles.actionCard}
                onPress={handleBookHotel}
                gradientColors={[theme.colors.primary[400], theme.colors.primary[600]]}
              >
                <View style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name="bed" size={32} color={theme.colors.text.inverse} />
                  </View>
                  <Text style={[globalStyles.h5, styles.actionTitle, { color: theme.colors.text.inverse }]}>Book a Hotel</Text>
                  <Text style={[globalStyles.bodySmall, styles.actionSubtitle, { color: theme.colors.text.inverse, opacity: 0.9 }]}>Find and book amazing stays</Text>
                </View>
              </ActionCard>

              <ActionCard
                variant="gradient"
                style={styles.actionCard}
                onPress={handleOrderFood}
                gradientColors={[theme.colors.secondary[400], theme.colors.secondary[600]]}
              >
                <View style={styles.actionContent}>
                  <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name="restaurant" size={32} color={theme.colors.text.inverse} />
                  </View>
                  <Text style={[globalStyles.h5, styles.actionTitle, { color: theme.colors.text.inverse }]}>Order Food</Text>
                  <Text style={[globalStyles.bodySmall, styles.actionSubtitle, { color: theme.colors.text.inverse, opacity: 0.9 }]}>Delicious meals delivered</Text>
                </View>
              </ActionCard>
            </ScrollView>
          </Section>

        {/* Stats Section with Cards */}
        <Section 
          title="Your Activity" 
          subtitle="Track your bookings and savings"
          variant="card"
          actionText="View All"
          actionIcon="chevron-forward"
          onActionPress={() => {}}
        >
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={[styles.statCard, { borderLeftColor: theme.colors.primary[500] }]}
              onPress={handleViewBookings}
              activeOpacity={0.7}
            >
              <Text style={[globalStyles.h3, { color: theme.colors.primary[500], fontSize: theme.typography.fontSize.xl }]}>5</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]} numberOfLines={1}>Bookings</Text>
              <Ionicons name="bed-outline" size={16} color={theme.colors.primary[500]} style={styles.statIcon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statCard, { borderLeftColor: theme.colors.secondary[500] }]}
              onPress={handleViewOrders}
              activeOpacity={0.7}
            >
              <Text style={[globalStyles.h3, { color: theme.colors.secondary[500], fontSize: theme.typography.fontSize.xl }]}>12</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]} numberOfLines={1}>Orders</Text>
              <Ionicons name="restaurant-outline" size={16} color={theme.colors.secondary[500]} style={styles.statIcon} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statCard, { borderLeftColor: theme.colors.success[500] }]}
              activeOpacity={0.7}
            >
              <Text style={[globalStyles.h3, { color: theme.colors.success[500], fontSize: theme.typography.fontSize.lg }]}>$420</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]} numberOfLines={1}>Saved</Text>
              <Ionicons name="wallet-outline" size={16} color={theme.colors.success[500]} style={styles.statIcon} />
            </TouchableOpacity>
          </View>
        </Section>

        {/* Recent Activity Enhanced */}
        <Section 
          title="Recent Activity" 
          subtitle="Your latest bookings and orders"
          variant="minimal"
        >
          <LoadingState 
            empty={true}
            emptyTitle="No recent activity"
            emptySubtitle="Your bookings and orders will appear here"
            emptyIcon="time-outline"
            variant="card"
          />
        </Section>

        {/* Popular This Week Enhanced */}
        <Section 
          title="Popular This Week" 
          subtitle="Trending offers and deals"
          variant="minimal"
          actionText="View All"
          actionIcon="chevron-forward"
          onActionPress={() => {}}
        >
          <ListItem
            title="Luxury Hotels"
            subtitle="30% off this weekend"
            description="Book premium accommodations with exclusive discounts"
            leftIcon="trending-up"
            rightIcon="chevron-forward"
            badge="Hot"
            badgeColor={theme.colors.warning[500]}
            onPress={() => handleBookHotel()}
            variant="card"
          />
          
          <ListItem
            title="Fast Food Delivery"
            subtitle="Free delivery on orders over $25"
            description="Quick meals delivered to your doorstep"
            leftIcon="restaurant-outline"
            rightIcon="chevron-forward"
            badge="New"
            badgeColor={theme.colors.error[500]}
            onPress={() => handleOrderFood()}
            variant="card"
          />
        </Section>
      </LoadingState>
    </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  
  // Quick Actions
  quickActionsScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  
  quickActionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  
  actionCard: {
    width: SCREEN_WIDTH * 0.7, // Make cards wider for better scrolling
    minWidth: 280, // Ensure minimum width
  },
  
  actionContent: {
    alignItems: 'center',
  },
  
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  actionTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  
  actionSubtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  
  // Stats Section
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...theme.shadows.sm,
    minHeight: 100,
    maxHeight: 120,
    aspectRatio: 1, // Make it more square
    justifyContent: 'space-between',
  },
  
  statLabel: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  statIcon: {
    marginTop: theme.spacing.xs,
  },
});

export default UserHomeScreen;