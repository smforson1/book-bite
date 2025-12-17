import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BusinessSetup from '../screens/manager/BusinessSetup';
import ManagerDashboard from '../screens/manager/ManagerDashboard';
import RoomList from '../screens/manager/RoomList';
import AddRoom from '../screens/manager/AddRoom';
import MenuList from '../screens/manager/MenuList';
import AddMenuItem from '../screens/manager/AddMenuItem';
import ManagerWallet from '../screens/manager/ManagerWallet';


const Stack = createNativeStackNavigator();

export default function ManagerStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ManagerDashboard"
                component={ManagerDashboard}
                options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
                name="BusinessSetup"
                component={BusinessSetup}
                options={{ title: 'Business Setup' }}
            />
            <Stack.Screen name="RoomList" component={RoomList} options={{ title: 'Rooms' }} />
            <Stack.Screen name="AddRoom" component={AddRoom} options={{ title: 'Add Room' }} />
            <Stack.Screen name="MenuList" component={MenuList} options={{ title: 'Menu' }} />
            <Stack.Screen
                name="AddMenuItem"
                component={AddMenuItem}
                options={{ title: 'Add Menu Item' }}
            />
            <Stack.Screen
                name="ManagerWallet"
                component={ManagerWallet}
                options={{ title: 'Wallet & Payouts' }}
            />
        </Stack.Navigator>
    );
}
