import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/user/HomeScreen';
import PlacesScreen from '../screens/user/PlacesScreen';
import BiteBotScreen from '../screens/user/BiteBotScreen';
import ActivityScreen from '../screens/user/ActivityScreen';
import CartScreen from '../screens/user/CartScreen';
import CustomTabBar from '../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Places" component={PlacesScreen} />
            <Tab.Screen name="BiteBot" component={BiteBotScreen} />
            <Tab.Screen name="Activity" component={ActivityScreen} />
            <Tab.Screen name="Cart" component={CartScreen} />
        </Tab.Navigator>
    );
}
