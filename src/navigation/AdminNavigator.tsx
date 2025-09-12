import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList } from '../types';
import { theme } from '../styles/theme';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminHotelsScreen from '../screens/admin/AdminHotelsScreen';
import AdminRestaurantsScreen from '../screens/admin/AdminRestaurantsScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Hotels':
              iconName = focused ? 'bed' : 'bed-outline';
              break;
            case 'Restaurants':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.error[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.error[500],
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.neutral[0],
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semiBold,
          fontSize: theme.typography.fontSize.lg,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: theme.colors.shadow.medium,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 85,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Tab.Screen 
        name="Users" 
        component={AdminUsersScreen}
        options={{ title: 'Manage Users' }}
      />
      <Tab.Screen 
        name="Hotels" 
        component={AdminHotelsScreen}
        options={{ title: 'Manage Hotels' }}
      />
      <Tab.Screen 
        name="Restaurants" 
        component={AdminRestaurantsScreen}
        options={{ title: 'Manage Restaurants' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={AdminBookingsScreen}
        options={{ title: 'All Bookings' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={AdminOrdersScreen}
        options={{ title: 'All Orders' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AdminAnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;