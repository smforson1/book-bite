import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import ManagerStack from './ManagerStack';
import MyBookings from '../screens/user/MyBookings';
import MyOrders from '../screens/user/MyOrders';
import BusinessDetails from '../screens/user/BusinessDetails';
import OrderCheckout from '../screens/user/OrderCheckout';
import UserStack from './UserStack';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthStack} />
            ) : user?.role === 'MANAGER' ? (
                <Stack.Screen name="ManagerRoot" component={ManagerStack} />
            ) : (
                <Stack.Screen name="UserRoot" component={UserStack} />
            )}
        </Stack.Navigator>
    );
}
