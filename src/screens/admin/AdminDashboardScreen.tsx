import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header, ActionCard, SkeletonCard } from '../../components';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const statsData = [
    { label: 'Total Users', value: '1,248', icon: 'people', color: theme.colors.primary[500] },
    { label: 'Active Hotels', value: '87', icon: 'bed', color: theme.colors.success[500] },
    { label: 'Restaurants', value: '156', icon: 'restaurant', color: theme.colors.secondary[500] },
    { label: 'Today\'s Bookings', value: '23', icon: 'calendar', color: theme.colors.warning[500] },
    { label: 'Today\'s Orders', value: '142', icon: 'receipt', color: theme.colors.error[500] },
    { label: 'Revenue Today', value: '$12,450', icon: 'cash', color: theme.colors.info[500] },
  ];

  const recentActivities = [
    { type: 'booking', text: 'New hotel booking at Grand Plaza', time: '2 min ago' },
    { type: 'order', text: 'Food order from Pizza Palace', time: '5 min ago' },
    { type: 'user', text: 'New user registration: John Doe', time: '12 min ago' },
    { type: 'hotel', text: 'Hotel "City Suites" updated room prices', time: '1 hour ago' },
    { type: 'restaurant', text: 'Restaurant "Tasty Bites" added new menu items', time: '2 hours ago' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'bed';
      case 'order': return 'restaurant';
      case 'user': return 'person-add';
      case 'hotel': return 'business';
      case 'restaurant': return 'storefront';
      default: return 'notifications';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <Header
        variant="gradient"
        title="Admin Dashboard"
        subtitle="Platform Overview & Management"
        showNotifications
        notificationCount={5}
        onNotificationPress={() => {}}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} style={styles.statCard} />
              ))
            ) : (
              statsData.map((stat, index) => (
                <ActionCard
                  key={index}
                  variant="primary"
                  style={styles.statCard}
                  enableHover={false}
                >
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </ActionCard>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <ActionCard
              variant="primary"
              style={styles.actionButton}
              onPress={() => {}}
            >
              <Ionicons name="person-add" size={20} color={theme.colors.primary[500]} />
              <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>Add User</Text>
            </ActionCard>
            
            <ActionCard
              variant="success"
              style={styles.actionButton}
              onPress={() => {}}
            >
              <Ionicons name="business" size={20} color={theme.colors.success[500]} />
              <Text style={[styles.actionText, { color: theme.colors.success[500] }]}>Add Hotel</Text>
            </ActionCard>
            
            <ActionCard
              variant="secondary"
              style={styles.actionButton}
              onPress={() => {}}
            >
              <Ionicons name="restaurant" size={20} color={theme.colors.secondary[500]} />
              <Text style={[styles.actionText, { color: theme.colors.secondary[500] }]}>Add Restaurant</Text>
            </ActionCard>
            
            <ActionCard
              variant="warning"
              style={styles.actionButton}
              onPress={() => {}}
            >
              <Ionicons name="settings" size={20} color={theme.colors.warning[600]} />
              <Text style={[styles.actionText, { color: theme.colors.warning[600] }]}>Settings</Text>
            </ActionCard>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name={getActivityIcon(activity.type) as any} size={16} color={theme.colors.text.secondary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error[500]} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  section: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  activityList: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  activityItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error[500],
    ...theme.shadows.sm,
  },
  logoutText: {
    color: theme.colors.error[500],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.sm,
  },
});

export default AdminDashboardScreen;