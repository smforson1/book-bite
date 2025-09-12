import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import HotelsStackNavigator from './HotelsStackNavigator';
import RestaurantsStackNavigator from './RestaurantsStackNavigator';
import BookingsScreen from '../screens/user/BookingsScreen';
import OrdersScreen from '../screens/user/OrdersScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';

const Tab = createBottomTabNavigator();

const UserNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
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
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary[500],
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
        name="Home" 
        component={UserHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Hotels" 
        component={HotelsStackNavigator}
        options={{ title: 'Hotels' }}
      />
      <Tab.Screen 
        name="Restaurants" 
        component={RestaurantsStackNavigator}
        options={{ title: 'Restaurants' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={UserProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default UserNavigator;