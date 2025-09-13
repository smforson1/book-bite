import React from 'react';
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
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

const HotelDashboardScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={[globalStyles.h2, styles.greeting]}>Welcome, {user?.name}! 🏨</Text>
            <Text style={[globalStyles.bodyLarge, styles.subtitle]}>Manage your hotel business</Text>
          </View>
          
          <View style={styles.hotelIcon}>
            <Ionicons name="business" size={48} color={theme.colors.success[500]} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.primary[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.primary[500] }]}>12</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Check-ins</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.warning[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.warning[500] }]}>8</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Check-outs</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.success[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.success[500] }]}>85%</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Occupancy</Text>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bed" size={20} color={theme.colors.success[500]} />
              <Text style={styles.actionText}>Manage Rooms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.actionText}>View Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people" size={20} color={theme.colors.secondary[500]} />
              <Text style={styles.actionText}>Guest Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={20} color={theme.colors.neutral[600]} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
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
              <Text style={[globalStyles.bodySmall, styles.emptySubtext]}>Hotel activities will appear here</Text>
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
  
  hotelIcon: {
    marginLeft: theme.spacing[4],
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
});

export default HotelDashboardScreen;