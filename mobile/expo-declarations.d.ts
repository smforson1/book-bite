declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg" {
    import React from "react";
    const content: React.FC<any>;
    export default content;
}

declare module "react-native-paystack-webview";
declare module "expo-device";
declare module "expo-constants";
declare module "expo-clipboard";
declare module "expo-image-picker";
declare module "expo-font";
declare module "expo-haptics";
declare module "expo-status-bar";

declare module "expo-notifications" {
    export type Notification = any;
    export type NotificationResponse = any;
    export type Subscription = any;
    export type EventSubscription = any;
    export const AndroidNotificationPriority: any;
    export const AndroidImportance: any;
    export function addNotificationReceivedListener(callback: (notification: Notification) => void): Subscription;
    export function addNotificationResponseReceivedListener(callback: (notification: NotificationResponse) => void): Subscription;
    export function removeNotificationSubscription(subscription: Subscription): void;
    export function setNotificationHandler(handler: any): void;
    export function getPermissionsAsync(): Promise<any>;
    export function requestPermissionsAsync(permissions?: any): Promise<any>;
    export function getExpoPushTokenAsync(options?: any): Promise<any>;
    export function setNotificationChannelAsync(name: string, channel: any): Promise<any>;
}

declare module "expo-location" {
    export type LocationObject = any;
    export const Accuracy: any;
    export function requestForegroundPermissionsAsync(): Promise<any>;
    export function getCurrentPositionAsync(options?: any): Promise<any>;
    export function reverseGeocodeAsync(location: any): Promise<any>;
}

declare module "expo-linking";
declare module "expo-av";
declare module "@react-navigation/native-stack";
declare module "@react-navigation/bottom-tabs" {
    export type BottomTabBarProps = any;
    export function createBottomTabNavigator(): any;
}
declare module "moti";
declare module "react-native-gesture-handler";
declare module "react-native-safe-area-context";
declare module "react-native-screens";
declare module "react-native-vector-icons/MaterialCommunityIcons";
declare module "react-native-paper";
