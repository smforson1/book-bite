import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ActionCard, Header } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const UserHomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  };

  const handleBookHotel = () => {
    // @ts-ignore
    navigation.navigate('Hotels');
  };

  const handleOrderFood = () => {
    // @ts-ignore
    navigation.navigate('Restaurants');
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
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
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Your Activity</Text>
          <View style={styles.statsRow}>
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.primary[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.primary[500] }]}>5</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Bookings</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.secondary[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.secondary[500] }]}>12</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Orders</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.success[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.success[500] }]}>$420</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Saved</Text>
            </Card>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="time-outline" size={48} color={theme.colors.text.tertiary} />
              </View>
              <Text style={[globalStyles.h5, styles.emptyText]}>No recent activity</Text>
              <Text style={[globalStyles.bodySmall, styles.emptySubtext]}>Your bookings and orders will appear here</Text>
            </View>
          </Card>
        </View>

        {/* Popular This Week */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Popular This Week</Text>
          
          <Card style={styles.popularItem}>
            <View style={styles.popularContent}>
              <View style={[styles.popularIcon, { backgroundColor: theme.colors.warning[100] }]}>
                <Ionicons name="trending-up" size={24} color={theme.colors.warning[600]} />
              </View>
              <View style={styles.popularText}>
                <Text style={[globalStyles.h5, styles.popularTitle]}>Luxury Hotels</Text>
                <Text style={[globalStyles.bodySmall, styles.popularSubtitle]}>30% off this weekend</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
          </Card>
          
          <Card style={styles.popularItem}>
            <View style={styles.popularContent}>
              <View style={[styles.popularIcon, { backgroundColor: theme.colors.error[100] }]}>
                <Ionicons name="restaurant-outline" size={24} color={theme.colors.error[600]} />
              </View>
              <View style={styles.popularText}>
                <Text style={[globalStyles.h5, styles.popularTitle]}>Fast Food Delivery</Text>
                <Text style={[globalStyles.bodySmall, styles.popularSubtitle]}>Free delivery on orders over $25</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={16} color={theme.colors.error[500]} />}
            style={StyleSheet.flatten([styles.logoutButton, { borderColor: theme.colors.error[500] }])}
            textStyle={{ color: theme.colors.error[500] }}
          />
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
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  
  actionCard: {
    flex: 1,
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
    marginBottom: theme.spacing[3],
  },
  
  actionTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing[1],
    color: theme.colors.text.primary,
  },
  
  actionSubtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
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
    borderLeftWidth: 4,
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
  
  // Recent Activity
  activityCard: {
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
  
  // Popular Items
  popularItem: {
    marginBottom: theme.spacing[3],
  },
  
  popularContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  
  popularIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  
  popularText: {
    flex: 1,
  },
  
  popularTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  
  popularSubtitle: {
    color: theme.colors.text.secondary,
  },
  
  // Logout Section
  logoutSection: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  
  logoutButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default UserHomeScreen;