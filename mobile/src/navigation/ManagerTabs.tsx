import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useBusinessStore } from '../store/useBusinessStore';
import ManagerDashboard from '../screens/manager/ManagerDashboard';
import RoomList from '../screens/manager/RoomList';
import MenuList from '../screens/manager/MenuList';
import OrderList from '../screens/manager/OrderList';
import ManagerMoreScreen from '../screens/manager/ManagerMoreScreen';
import CustomTabBar from '../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function ManagerTabs() {
    const business = useBusinessStore((state) => state.business);

    // Dynamic Manage Tab based on business type
    const ManageComponent = (business?.type === 'HOTEL' || business?.type === 'HOSTEL')
        ? RoomList
        : MenuList;

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen name="Dashboard" component={ManagerDashboard} />
            <Tab.Screen
                name="Manage"
                component={ManageComponent}
                options={{
                    title: business?.type === 'RESTAURANT' ? 'Menu' : 'Rooms'
                }}
            />
            <Tab.Screen
                name="Orders"
                component={OrderList}
                options={{
                    title: (business?.type === 'HOTEL' || business?.type === 'HOSTEL') ? 'Bookings' : 'Orders'
                }}
            />
            <Tab.Screen
                name="More"
                component={ManagerMoreScreen}
                options={{
                    tabBarIcon: ({ color, size }) => null // Handled by CustomTabBar, but good for type safety 
                }}
            />
        </Tab.Navigator>
    );
}
