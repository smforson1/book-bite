// Ghana-optimized map component for BookBite
// Integrates with Google Maps and provides Ghana-specific functionality

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Region,
  LatLng,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../theme';

// Types
export interface MapMarker {
  id: string;
  coordinate: LatLng;
  title: string;
  description?: string;
  type: 'restaurant' | 'hotel' | 'delivery' | 'user';
  color?: string;
}

interface Props {
  markers?: MapMarker[];
  initialRegion?: Region;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (coordinate: LatLng) => void;
  showUserLocation?: boolean;
  showDeliveryRoute?: boolean;
  deliveryRoute?: LatLng[];
  style?: any;
  onRegionChange?: (region: Region) => void;
  onMapReady?: () => void;
}

// Ghana major cities coordinates
const GHANA_CITIES = {
  accra: {
    latitude: 5.6037,
    longitude: -0.1870,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  kumasi: {
    latitude: 6.6885,
    longitude: -1.6244,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  takoradi: {
    latitude: 4.8845,
    longitude: -1.7554,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  capeCoast: {
    latitude: 5.1293,
    longitude: -1.2783,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  tamale: {
    latitude: 9.4034,
    longitude: -0.8424,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
};

// Default Ghana region (centered on Ghana)
const DEFAULT_GHANA_REGION: Region = {
  latitude: 7.9465,
  longitude: -1.0232,
  latitudeDelta: 8.0,
  longitudeDelta: 8.0,
};

export const GhanaMapComponent: React.FC<Props> = ({
  markers = [],
  initialRegion = DEFAULT_GHANA_REGION,
  onMarkerPress,
  onMapPress,
  showUserLocation = true,
  showDeliveryRoute = false,
  deliveryRoute = [],
  style,
  onRegionChange,
  onMapReady,
}) => {
  const mapRef = useRef<MapView>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  // Request location permission and get user location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationPermission(true);
        
        if (showUserLocation) {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const userCoordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          setUserLocation(userCoordinate);
          
          // Center map on user location if in Ghana
          if (isInGhana(userCoordinate)) {
            const userRegion: Region = {
              ...userCoordinate,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            setCurrentRegion(userRegion);
            mapRef.current?.animateToRegion(userRegion, 1000);
          }
        }
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission is required to show your position on the map and provide accurate delivery estimates.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if coordinate is within Ghana boundaries
  const isInGhana = (coordinate: LatLng): boolean => {
    // Ghana approximate boundaries
    const ghanaBounds = {
      north: 11.17,
      south: 4.74,
      east: 1.19,
      west: -3.26,
    };
    
    return (
      coordinate.latitude >= ghanaBounds.south &&
      coordinate.latitude <= ghanaBounds.north &&
      coordinate.longitude >= ghanaBounds.west &&
      coordinate.longitude <= ghanaBounds.east
    );
  };

  // Handle map press
  const handleMapPress = useCallback((event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    onMapPress?.(coordinate);
  }, [onMapPress]);

  // Handle marker press
  const handleMarkerPress = useCallback((marker: MapMarker) => {
    onMarkerPress?.(marker);
  }, [onMarkerPress]);

  // Center map on user location
  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      const region: Region = {
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [userLocation]);

  // Quick navigation to major Ghana cities
  const centerOnAccra = () => {
    mapRef.current?.animateToRegion(GHANA_CITIES.accra, 1000);
  };

  const centerOnKumasi = () => {
    mapRef.current?.animateToRegion(GHANA_CITIES.kumasi, 1000);
  };

  // Get marker color based on type
  const getMarkerColor = (type: MapMarker['type']): string => {
    switch (type) {
      case 'restaurant':
        return theme.colors.primary[500];
      case 'hotel':
        return theme.colors.secondary[500];
      case 'delivery':
        return '#4CAF50';
      case 'user':
        return '#2196F3';
      default:
        return theme.colors.primary[500];
    }
  };

  // Get marker icon based on type
  const getMarkerIcon = (type: MapMarker['type']): string => {
    switch (type) {
      case 'restaurant':
        return 'restaurant';
      case 'hotel':
        return 'bed';
      case 'delivery':
        return 'car';
      case 'user':
        return 'person';
      default:
        return 'location';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loading, style]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading Ghana Map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={currentRegion}
        onPress={handleMapPress}
        onMapReady={onMapReady}
        showsUserLocation={showUserLocation && locationPermission}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
        customMapStyle={ghanaMapStyle}
      >
        {/* Render custom markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || getMarkerColor(marker.type)}
            onPress={() => handleMarkerPress(marker)}
          >
            <View style={[styles.markerContainer, { backgroundColor: marker.color || getMarkerColor(marker.type) }]}>
              <Ionicons 
                name={getMarkerIcon(marker.type) as any} 
                size={20} 
                color="#FFFFFF" 
              />
            </View>
          </Marker>
        ))}

        {/* User location marker */}
        {userLocation && showUserLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Delivery route */}
        {showDeliveryRoute && deliveryRoute.length > 1 && (
          <Polyline
            coordinates={deliveryRoute}
            strokeColor={theme.colors.primary[500]}
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {/* Control buttons */}
      <View style={styles.controls}>
        {/* Center on user location */}
        {locationPermission && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnUser}
          >
            <Ionicons name="locate" size={24} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        )}

        {/* Quick city navigation */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnAccra}
        >
          <Text style={styles.cityButtonText}>Accra</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnKumasi}
        >
          <Text style={styles.cityButtonText}>Kumasi</Text>
        </TouchableOpacity>
      </View>

      {/* Ghana delivery areas indicator */}
      <View style={styles.deliveryInfo}>
        <Ionicons name="information-circle" size={16} color={theme.colors.primary[500]} />
        <Text style={styles.deliveryInfoText}>
          Service available in major Ghana cities
        </Text>
      </View>
    </View>
  );
};

// Ghana-optimized map styling
const ghanaMapStyle = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#e9e9e9"
      },
      {
        lightness: 17
      }
    ]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5"
      },
      {
        lightness: 20
      }
    ]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  controlButton: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  cityButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: '500',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  deliveryInfo: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  deliveryInfoText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default GhanaMapComponent;