import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import HotelsStackNavigator from './HotelsStackNavigator';
import RestaurantsStackNavigator from './RestaurantsStackNavigator';
import BookingsScreen from '../screens/user/BookingsScreen';
import OrdersScreen from '../screens/user/OrdersScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';

const Tab = createBottomTabNavigator();

// Enhanced Tab Icon Component with animations and badges
const AnimatedTabIcon: React.FC<{
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  badgeCount?: number;
}> = ({ focused, iconName, color, size, badgeCount }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 3,
    }).start();
  }, [focused, scaleValue]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleValue }],
            backgroundColor: focused ? `${theme.colors.primary[500]}20` : 'transparent',
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Ionicons name={iconName} size={size} color={color} />
      </Animated.View>
      {badgeCount && badgeCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -3,
            backgroundColor: theme.colors.error[500],
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.colors.background.primary,
          }}
        >
          <Text
            style={{
              color: theme.colors.text.inverse,
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const UserNavigator: React.FC = () => {
  // Mock badge counts - in a real app, these would come from state/context
  const badgeCounts = {
    Home: 0,
    Hotels: 0,
    Restaurants: 2, // New offers
    Bookings: 1, // Upcoming booking
    Orders: 3, // Active orders
    Profile: 0,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let badgeCount = 0;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              badgeCount = badgeCounts.Home;
              break;
            case 'Hotels':
              iconName = focused ? 'bed' : 'bed-outline';
              badgeCount = badgeCounts.Hotels;
              break;
            case 'Restaurants':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              badgeCount = badgeCounts.Restaurants;
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              badgeCount = badgeCounts.Bookings;
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              badgeCount = badgeCounts.Orders;
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              badgeCount = badgeCounts.Profile;
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <AnimatedTabIcon
              focused={focused}
              iconName={iconName}
              color={color}
              size={size}
              badgeCount={badgeCount}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: false, // Using our custom headers now
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: theme.colors.shadow.dark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          height: 90,
          paddingBottom: 12,
          paddingTop: 12,
          borderTopLeftRadius: theme.borderRadius['2xl'],
          borderTopRightRadius: theme.borderRadius['2xl'],
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semiBold,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
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
        options={{ title: 'Bookings' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'Orders' }}
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