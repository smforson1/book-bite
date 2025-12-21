import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';

interface BusinessMapViewProps {
    businesses?: Array<{
        id: string;
        name: string;
        type: string;
        address: string;
        latitude?: number;
        longitude?: number;
    }>;
    singleLocation?: {
        latitude: number;
        longitude: number;
        name: string;
    };
    height?: number;
    onMarkerPress?: (businessId: string) => void;
}

export default function BusinessMapView({
    businesses,
    singleLocation,
    height = 300,
    onMarkerPress
}: BusinessMapViewProps) {
    const { colors } = useTheme();
    const [region, setRegion] = useState({
        latitude: 5.6037,  // Default to Accra, Ghana
        longitude: -0.1870,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
        } catch (error) {
            console.error('Error getting location', error);
        }
    };

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'HOTEL':
            case 'HOSTEL':
                return '#1976D2'; // Blue
            case 'RESTAURANT':
            case 'CAFE':
                return colors.primary; // Burnt Orange
            default:
                return colors.primary;
        }
    };

    return (
        <View style={[styles.container, { height }]}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={singleLocation ? {
                    latitude: singleLocation.latitude,
                    longitude: singleLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                } : region}
                showsUserLocation
                showsMyLocationButton
            >
                {singleLocation && (
                    <Marker
                        coordinate={{
                            latitude: singleLocation.latitude,
                            longitude: singleLocation.longitude,
                        }}
                        title={singleLocation.name}
                        pinColor={colors.primary}
                    />
                )}

                {businesses && businesses.map((business) => {
                    if (!business.latitude || !business.longitude) return null;
                    return (
                        <Marker
                            key={business.id}
                            coordinate={{
                                latitude: business.latitude,
                                longitude: business.longitude,
                            }}
                            title={business.name}
                            description={business.address}
                            pinColor={getMarkerColor(business.type)}
                            onPress={() => onMarkerPress && onMarkerPress(business.id)}
                        />
                    );
                })}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
        borderRadius: 12,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
