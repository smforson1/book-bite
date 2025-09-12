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

const RestaurantDashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={[globalStyles.h2, styles.greeting]}>Welcome, {user?.name}! 🍽️</Text>
            <Text style={[globalStyles.bodyLarge, styles.subtitle]}>Manage your restaurant business</Text>
          </View>
          
          <View style={styles.restaurantIcon}>
            <Ionicons name="restaurant" size={48} color={theme.colors.secondary[500]} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.primary[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.primary[500] }]}>24</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Orders</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.secondary[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.secondary[500] }]}>$850</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Revenue</Text>
            </Card>
            
            <Card style={StyleSheet.flatten([styles.statCard, { borderLeftColor: theme.colors.success[500] }])}>
              <Text style={[globalStyles.h3, { color: theme.colors.success[500] }]}>15</Text>
              <Text style={[globalStyles.bodySmall, styles.statLabel]}>Menu Items</Text>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="restaurant" size={20} color={theme.colors.secondary[500]} />
              <Text style={styles.actionText}>Manage Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="receipt" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="analytics" size={20} color={theme.colors.warning[500]} />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={20} color={theme.colors.neutral[600]} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Recent Orders</Text>
          <Card style={styles.ordersCard}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={48} color={theme.colors.text.tertiary} />
              </View>
              <Text style={[globalStyles.h5, styles.emptyText]}>No recent orders</Text>
              <Text style={[globalStyles.bodySmall, styles.emptySubtext]}>Customer orders will appear here</Text>
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

export default RestaurantDashboardScreen;