import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  name?: string;
  formattedAddress?: string;
}

export interface UserLocation {
  coordinates: LocationCoordinates;
  address: LocationAddress;
  accuracy?: number;
  timestamp: number;
}

export interface SavedLocation {
  id: string;
  name: string;
  coordinates: LocationCoordinates;
  address: LocationAddress;
  type: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

class LocationService {
  private currentLocation: UserLocation | null = null;
  private watchId: Location.LocationSubscription | null = null;

  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use location features like delivery address and nearby restaurants.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation(highAccuracy: boolean = true): Promise<UserLocation | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
      });

      const coordinates: LocationCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Reverse geocode to get address
      const address = await this.reverseGeocode(coordinates);

      const userLocation: UserLocation = {
        coordinates,
        address,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      this.currentLocation = userLocation;
      return userLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      return null;
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(coordinates: LocationCoordinates): Promise<LocationAddress> {
    try {
      const results = await Location.reverseGeocodeAsync(coordinates);

      if (results.length > 0) {
        const result = results[0];
        return {
          street: result.street || undefined,
          city: result.city || undefined,
          region: result.region || undefined,
          postalCode: result.postalCode || undefined,
          country: result.country || undefined,
          name: result.name || undefined,
          formattedAddress: this.formatAddress(result),
        };
      }

      return {
        formattedAddress: `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {
        formattedAddress: `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
      };
    }
  }

  // Forward geocode address to coordinates
  async geocodeAddress(address: string): Promise<LocationCoordinates[]> {
    try {
      const results = await Location.geocodeAsync(address);
      return results.map(result => ({
        latitude: result.latitude,
        longitude: result.longitude,
      }));
    } catch (error) {
      console.error('Error geocoding address:', error);
      return [];
    }
  }

  // Format address for display
  private formatAddress(address: any): string {
    const parts = [];

    if (address.name) parts.push(address.name);
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);

    return parts.join(', ') || 'Unknown location';
  }

  // Start watching location changes
  async startWatchingLocation(callback: (location: UserLocation) => void): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 50, // 50 meters
        },
        async (location) => {
          const coordinates: LocationCoordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          const address = await this.reverseGeocode(coordinates);

          const userLocation: UserLocation = {
            coordinates,
            address,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };

          this.currentLocation = userLocation;
          callback(userLocation);
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location watch:', error);
      return false;
    }
  }

  // Stop watching location changes
  stopWatchingLocation(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // Calculate distance between two coordinates (in kilometers)
  calculateDistance(coord1: LocationCoordinates, coord2: LocationCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get cached current location
  getCachedLocation(): UserLocation | null {
    return this.currentLocation;
  }

  // Check if location services are enabled
  async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  // Get location accuracy description
  getAccuracyDescription(accuracy?: number): string {
    if (!accuracy) return 'Unknown accuracy';

    if (accuracy <= 5) return 'Very high accuracy';
    if (accuracy <= 10) return 'High accuracy';
    if (accuracy <= 50) return 'Good accuracy';
    if (accuracy <= 100) return 'Fair accuracy';
    return 'Low accuracy';
  }

  // Ghana-specific location validation
  isLocationInGhana(coordinates: LocationCoordinates): boolean {
    // Ghana's approximate bounding box
    const ghana = {
      north: 11.2,
      south: 4.5,
      east: 1.3,
      west: -3.3
    };

    return (
      coordinates.latitude >= ghana.south &&
      coordinates.latitude <= ghana.north &&
      coordinates.longitude >= ghana.west &&
      coordinates.longitude <= ghana.east
    );
  }

  // Get Ghana regions based on coordinates (simplified)
  getGhanaRegion(coordinates: LocationCoordinates): string {
    // This is a simplified version - in production, you'd use a proper geocoding service
    if (!this.isLocationInGhana(coordinates)) return 'Unknown';

    // Greater Accra region (approximate)
    if (coordinates.latitude >= 5.3 && coordinates.latitude <= 6.0 &&
      coordinates.longitude >= -0.5 && coordinates.longitude <= 0.5) {
      return 'Greater Accra';
    }

    // Ashanti region (approximate)
    if (coordinates.latitude >= 6.0 && coordinates.latitude <= 7.5 &&
      coordinates.longitude >= -2.5 && coordinates.longitude <= -0.5) {
      return 'Ashanti';
    }

    // Add more regions as needed
    return 'Other';
  }
}

export const locationService = new LocationService();