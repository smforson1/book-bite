import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import BusinessSetup from '../screens/manager/BusinessSetup';
import ManagerTabs from './ManagerTabs';
import AddRoom from '../screens/manager/AddRoom';
import AddMenuItem from '../screens/manager/AddMenuItem';
import OrderDetail from '../screens/manager/OrderDetail';
import ProfileScreen from '../screens/user/ProfileScreen';


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
            <Stack.Screen
                name="AddMenuItem"
                component={AddMenuItem}
                options={{ title: 'Add Menu Item' }}
            />
            <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Details' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
