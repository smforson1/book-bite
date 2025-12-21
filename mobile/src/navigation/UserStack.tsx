import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import BusinessDetails from '../screens/user/BusinessDetails';
import BookingCheckout from '../screens/user/BookingCheckout';
import OrderCheckout from '../screens/user/OrderCheckout';

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
                component={require('../screens/user/AddReviewScreen').default}
                options={{ title: 'Write a Review' }}
            />
            <Stack.Screen
                name="Profile"
                component={require('../screens/user/ProfileScreen').default}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
