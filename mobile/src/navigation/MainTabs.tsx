import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import HomeScreen from '../screens/user/HomeScreen';
import MyBookings from '../screens/user/MyBookings';
import ProfileScreen from '../screens/user/ProfileScreen'; // Needs creation or placeholder

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'home';
                    if (route.name === 'Bookings') iconName = 'calendar';
                    if (route.name === 'Profile') iconName = 'account';

                    return <IconButton icon={iconName} iconColor={color} size={size} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Bookings" component={MyBookings} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
