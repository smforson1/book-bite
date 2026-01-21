import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getPermissions = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return false;
        }
        return true;
    };

    const getCurrentLocation = async () => {
        setLoading(true);
        try {
            const hasPermission = await getPermissions();
            if (!hasPermission) {
                setLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setLocation(loc);

            // Reverse geocode
            const [geo] = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });

            if (geo) {
                const addr = `${geo.streetNumber || ''} ${geo.street || ''}, ${geo.city || ''} ${geo.region || ''}, ${geo.country || ''}`.trim();
                setAddress(addr);
            }
        } catch (error: any) {
            setErrorMsg(error.message);
            Alert.alert('Location Error', 'Failed to get current location. Please check your GPS and try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        location,
        address,
        errorMsg,
        loading,
        getCurrentLocation,
    };
};
