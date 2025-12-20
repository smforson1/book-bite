import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import ManagerStack from './ManagerStack';
import MyBookings from '../screens/user/MyBookings';
import MyOrders from '../screens/user/MyOrders';
import BusinessDetails from '../screens/user/BusinessDetails';
import OrderCheckout from '../screens/user/OrderCheckout';
import UserStack from './UserStack';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeProvider } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Auth">
                    {() => <ThemeProvider><AuthStack /></ThemeProvider>}
                </Stack.Screen>
            ) : user?.role === 'MANAGER' ? (
                <Stack.Screen name="ManagerRoot">
                    {() => (
                        <ThemeProvider isManager={true}>
                            <Stack.Navigator screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="Manager" component={ManagerStack} />
                                <Stack.Screen name="OrderCheckout" component={OrderCheckout} options={{ title: 'Checkout' }} />
                                <Stack.Screen name="MyBookings" component={MyBookings} options={{ title: 'My Bookings' }} />
                                <Stack.Screen name="MyOrders" component={MyOrders} options={{ title: 'My Orders' }} />
                            </Stack.Navigator>
                        </ThemeProvider>
                    )}
                </Stack.Screen>
            ) : (
                <Stack.Screen name="UserRoot">
                    {() => (
                        <ThemeProvider>
                            <Stack.Navigator screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="User" component={UserStack} />
                                <Stack.Screen name="OrderCheckout" component={OrderCheckout} options={{ title: 'Checkout' }} />
                                <Stack.Screen name="MyBookings" component={MyBookings} options={{ title: 'My Bookings' }} />
                                <Stack.Screen name="MyOrders" component={MyOrders} options={{ title: 'My Orders' }} />
                            </Stack.Navigator>
                        </ThemeProvider>
                    )}
                </Stack.Screen>
            )}
        </Stack.Navigator>
    );
}
