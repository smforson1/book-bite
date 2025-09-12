import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import HotelDashboardScreen from '../screens/hotel/HotelDashboardScreen';
import HotelRoomsScreen from '../screens/hotel/HotelRoomsScreen';
import HotelBookingsScreen from '../screens/hotel/HotelBookingsScreen';
import HotelProfileScreen from '../screens/hotel/HotelProfileScreen';

const Tab = createBottomTabNavigator();

const HotelNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Rooms':
              iconName = focused ? 'bed' : 'bed-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'business' : 'business-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.success[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.success[500],
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
        component={HotelDashboardScreen}
        options={{ title: 'Hotel Dashboard' }}
      />
      <Tab.Screen 
        name="Rooms" 
        component={HotelRoomsScreen}
        options={{ title: 'Manage Rooms' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={HotelBookingsScreen}
        options={{ title: 'Bookings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={HotelProfileScreen}
        options={{ title: 'Hotel Profile' }}
      />
    </Tab.Navigator>
  );
};

export default HotelNavigator;