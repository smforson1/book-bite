import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import BusinessSetup from '../screens/manager/BusinessSetup';
import ManagerTabs from './ManagerTabs';
import AddRoom from '../screens/manager/AddRoom';
import AddMenuItem from '../screens/manager/AddMenuItem';
import OrderDetail from '../screens/manager/OrderDetail';
import ProfileScreen from '../screens/user/ProfileScreen';


import ManagerMoreScreen from '../screens/manager/ManagerMoreScreen';
import InventoryScreen from '../screens/manager/InventoryScreen';
import AnalyticsScreen from '../screens/manager/AnalyticsScreen';
import ManagerWallet from '../screens/manager/ManagerWallet';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import AddManualBooking from '../screens/manager/AddManualBooking';
import ActiveGuestsScreen from '../screens/manager/ActiveGuestsScreen';
import BookingDetail from '../screens/manager/BookingDetail';

const Stack = createNativeStackNavigator();

export default function ManagerStack() {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.primary,
                headerTitleStyle: { fontWeight: 'bold' },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="ManagerRoot"
                component={ManagerTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="BusinessSetup"
                component={BusinessSetup}
                options={{ title: 'Business Setup' }}
            />
            <Stack.Screen name="AddRoom" component={AddRoom} options={{ title: 'Add Room' }} />
            <Stack.Screen name="EditRoom" component={AddRoom} options={{ title: 'Edit Room' }} />
            <Stack.Screen
                name="AddMenuItem"
                component={AddMenuItem}
                options={{ title: 'Add Menu Item' }}
            />
            <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Details' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

            {/* Screens accessed via More Tab */}
            <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="Wallet" component={ManagerWallet} options={{ title: 'My Wallet' }} />
            <Stack.Screen name="AddManualBooking" component={AddManualBooking} options={{ title: 'Manual Booking' }} />
            <Stack.Screen name="ActiveGuests" component={ActiveGuestsScreen} options={{ title: 'Active Guests' }} />
            <Stack.Screen name="BookingDetail" component={BookingDetail} options={{ title: 'Booking Details' }} />
        </Stack.Navigator>
    );
}
