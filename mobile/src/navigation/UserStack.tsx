import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import BusinessDetails from '../screens/user/BusinessDetails';
import BookingCheckout from '../screens/user/BookingCheckout';
import OrderCheckout from '../screens/user/OrderCheckout';
import MyBookings from '../screens/user/MyBookings';
import MyOrders from '../screens/user/MyOrders';
import AddReviewScreen from '../screens/user/AddReviewScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import WalletScreen from '../screens/user/WalletScreen';

const Stack = createNativeStackNavigator();

export default function UserStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="BusinessDetails"
                component={BusinessDetails}
                options={{ title: 'Details' }}
            />
            <Stack.Screen
                name="BookingCheckout"
                component={BookingCheckout}
                options={{ title: 'Complete Booking' }}
            />
            <Stack.Screen
                name="OrderCheckout"
                component={OrderCheckout}
                options={{ title: 'Complete Order' }}
            />
            <Stack.Screen
                name="AddReview"
                component={AddReviewScreen}
                options={{ title: 'Write a Review' }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Wallet"
                component={WalletScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="MyBookings"
                component={MyBookings}
                options={{ title: 'My Bookings' }}
            />
            <Stack.Screen
                name="MyOrders"
                component={MyOrders}
                options={{ title: 'My Orders' }}
            />
        </Stack.Navigator>
    );
}
