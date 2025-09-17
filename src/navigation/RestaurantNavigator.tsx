import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme as theme } from '../styles/theme';
import RestaurantDashboardScreen from '../screens/restaurant/RestaurantDashboardScreen';
import RestaurantMenuScreen from '../screens/restaurant/RestaurantMenuScreen';
import RestaurantOrdersScreen from '../screens/restaurant/RestaurantOrdersScreen';
import RestaurantProfileScreen from '../screens/restaurant/RestaurantProfileScreen';
import RestaurantMenuManagementScreen from '../screens/restaurant/RestaurantMenuManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Dashboard and Menu Management
const DashboardStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="RestaurantDashboard" 
        component={RestaurantDashboardScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="RestaurantMenuManagement" 
        component={RestaurantMenuManagementScreen}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

const RestaurantNavigator: React.FC = () => {
  // Theme hook removed as part of dark mode revert
  const currentTheme = theme;
  
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
        tabBarActiveTintColor: currentTheme.colors.secondary[500],
        tabBarInactiveTintColor: currentTheme.colors.text.tertiary,
        headerShown: true,
        headerStyle: {
          backgroundColor: currentTheme.colors.secondary[500],
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: currentTheme.colors.neutral[0],
        headerTitleStyle: {
          fontWeight: currentTheme.typography.fontWeight.semiBold,
          fontSize: currentTheme.typography.fontSize.lg,
        },
        tabBarStyle: {
          backgroundColor: currentTheme.colors.background.primary,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: currentTheme.colors.shadow.medium,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 85,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: currentTheme.typography.fontSize.xs,
          fontWeight: currentTheme.typography.fontWeight.medium,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ 
          title: 'Restaurant Dashboard',
          headerShown: true,
          headerStyle: {
            backgroundColor: currentTheme.colors.secondary[500],
          },
          headerTintColor: currentTheme.colors.neutral[0],
          headerTitleStyle: {
            fontWeight: currentTheme.typography.fontWeight.semiBold,
            fontSize: currentTheme.typography.fontSize.lg,
          },
        }}
      />
      <Tab.Screen 
        name="Menu" 
        component={RestaurantMenuManagementScreen}
        options={{ 
          title: 'Manage Menu',
          headerShown: true,
          headerStyle: {
            backgroundColor: currentTheme.colors.secondary[500],
          },
          headerTintColor: currentTheme.colors.neutral[0],
          headerTitleStyle: {
            fontWeight: currentTheme.typography.fontWeight.semiBold,
            fontSize: currentTheme.typography.fontSize.lg,
          },
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={RestaurantOrdersScreen}
        options={{ 
          title: 'Orders',
          headerShown: true,
          headerStyle: {
            backgroundColor: currentTheme.colors.secondary[500],
          },
          headerTintColor: currentTheme.colors.neutral[0],
          headerTitleStyle: {
            fontWeight: currentTheme.typography.fontWeight.semiBold,
            fontSize: currentTheme.typography.fontSize.lg,
          },
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={RestaurantProfileScreen}
        options={{ 
          title: 'Restaurant Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: currentTheme.colors.secondary[500],
          },
          headerTintColor: currentTheme.colors.neutral[0],
          headerTitleStyle: {
            fontWeight: currentTheme.typography.fontWeight.semiBold,
            fontSize: currentTheme.typography.fontSize.lg,
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default RestaurantNavigator;