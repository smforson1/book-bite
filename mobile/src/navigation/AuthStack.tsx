import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PurchaseCodeScreen from '../screens/auth/PurchaseCodeScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={hasSeenOnboarding ? "Login" : "Onboarding"}
        >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PurchaseCode" component={PurchaseCodeScreen} />
        </Stack.Navigator>
    );
}
