import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import RestaurantDashboardScreen from '../screens/restaurant/RestaurantDashboardScreen';
import RestaurantMenuScreen from '../screens/restaurant/RestaurantMenuScreen';
import RestaurantOrdersScreen from '../screens/restaurant/RestaurantOrdersScreen';
import RestaurantProfileScreen from '../screens/restaurant/RestaurantProfileScreen';

const Tab = createBottomTabNavigator();

const RestaurantNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Menu':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.secondary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.secondary[500],
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
        component={RestaurantDashboardScreen}
        options={{ title: 'Restaurant Dashboard' }}
      />
      <Tab.Screen 
        name="Menu" 
        component={RestaurantMenuScreen}
        options={{ title: 'Manage Menu' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={RestaurantOrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={RestaurantProfileScreen}
        options={{ title: 'Restaurant Profile' }}
      />
    </Tab.Navigator>
  );
};

export default RestaurantNavigator;