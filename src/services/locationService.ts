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
  country?: string;
  postalCode?: string;
  name?: string;
}

export interface GhanaLocation extends LocationCoordinates {
  address?: LocationAddress;
  accuracy?: number;
  timestamp?: number;
}

// Ghana regions and major cities
export const GHANA_REGIONS = [
  'Greater Accra Region',
  'Ashanti Region',
  'Western Region',
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Upper East Region',
  'Upper West Region',
  'Volta Region',
  'Brong-Ahafo Region',
];

export const GHANA_MAJOR_CITIES = [
  'Accra',
  'Kumasi',
  'Tamale',
  'Takoradi',
  'Cape Coast',
  'Sunyani',
  'Koforidua',
  'Ho',
  'Wa',
  'Bolgatanga',
  'Tema',
  'Obuasi',
  'Techiman',
  'Bawku',
  'Nkawkaw',
];

class LocationService {
  private currentLocation: GhanaLocation | null = null;
  private watchId: Location.LocationSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'BookBite needs location access to show nearby hotels and restaurants, and to provide accurate delivery services.',
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

  async getCurrentCity(): Promise<{ city: string; region: string } | null> {
    try {
      const location = await this.getCurrentLocation();
      if (location && location.address) {
        return {
          city: location.address.city || 'Unknown City',
          region: location.address.region || 'Unknown Region'
        };
      }
      
      // Fallback to default Ghana location
      return {
        city: 'Accra',
        region: 'Greater Accra Region'
      };
    } catch (error) {
      console.error('Error getting current city:', error);
      return {
        city: 'Accra',
        region: 'Greater Accra Region'
      };
    }
  }

  async getCurrentLocation(): Promise<GhanaLocation | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        // timeout: 15000,
      });

      const ghanaLocation: GhanaLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        timestamp: location.timestamp,
      };

      // Reverse geocode to get address if within Ghana
      if (this.isLocationInGhana(ghanaLocation)) {
        const address = await this.reverseGeocode(ghanaLocation);
        ghanaLocation.address = address;
      }

      this.currentLocation = ghanaLocation;
      return ghanaLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings and try again.'
      );
      return null;
    }
  }

  async reverseGeocode(coordinates: LocationCoordinates): Promise<LocationAddress | undefined> {
    try {
      const [geocodeResult] = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (geocodeResult) {
        return {
          street: geocodeResult.street || geocodeResult.streetNumber ? `${geocodeResult.streetNumber || ''} ${geocodeResult.street || ''}`.trim() : undefined,
          city: geocodeResult.city || undefined,
          region: geocodeResult.region || undefined,
          country: geocodeResult.country || undefined,
          postalCode: geocodeResult.postalCode || undefined,
          name: geocodeResult.name || undefined,
        };
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
    return undefined;
  }

  async geocode(address: string): Promise<LocationCoordinates[]> {
    try {
      // Add Ghana to search to improve accuracy
      const searchAddress = address.toLowerCase().includes('ghana') ? address : `${address}, Ghana`;
      
      const geocodeResults = await Location.geocodeAsync(searchAddress);
      
      return geocodeResults
        .filter(result => this.isLocationInGhana(result))
        .map(result => ({
          latitude: result.latitude,
          longitude: result.longitude,
        }));
    } catch (error) {
      console.error('Error geocoding address:', error);
      return [];
    }
  }

  isLocationInGhana(coordinates: LocationCoordinates): boolean {
    // Ghana's approximate bounding box
    const GHANA_BOUNDS = {
      north: 11.2,   // Northern border
      south: 4.5,    // Southern border (coast)
      east: 1.3,     // Eastern border
      west: -3.5,    // Western border
    };

    return (
      coordinates.latitude >= GHANA_BOUNDS.south &&
      coordinates.latitude <= GHANA_BOUNDS.north &&
      coordinates.longitude >= GHANA_BOUNDS.west &&
      coordinates.longitude <= GHANA_BOUNDS.east
    );
  }

  calculateDistance(point1: LocationCoordinates, point2: LocationCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(point2.latitude - point1.latitude);
    const dLon = this.degToRad(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(point1.latitude)) * Math.cos(this.degToRad(point2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  }

  private degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async startLocationTracking(
    callback: (location: GhanaLocation) => void,
    options?: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    }
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy || Location.Accuracy.Balanced,
          timeInterval: options?.timeInterval || 30000, // 30 seconds
          distanceInterval: options?.distanceInterval || 100, // 100 meters
        },
        async (location) => {
          const ghanaLocation: GhanaLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            timestamp: location.timestamp,
          };

          if (this.isLocationInGhana(ghanaLocation)) {
            const address = await this.reverseGeocode(ghanaLocation);
            ghanaLocation.address = address;
            this.currentLocation = ghanaLocation;
            callback(ghanaLocation);
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  stopLocationTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  getCachedLocation(): GhanaLocation | null {
    return this.currentLocation;
  }

  // Get popular delivery areas in Ghana
  getPopularDeliveryAreas(): Array<{ name: string; coordinates: LocationCoordinates }> {
    return [
      // Accra areas
      { name: 'East Legon, Accra', coordinates: { latitude: 5.6037, longitude: -0.1870 } },
      { name: 'Cantonments, Accra', coordinates: { latitude: 5.5720, longitude: -0.1820 } },
      { name: 'Airport Residential, Accra', coordinates: { latitude: 5.6050, longitude: -0.1717 } },
      { name: 'Osu, Accra', coordinates: { latitude: 5.5562, longitude: -0.1759 } },
      { name: 'Adabraka, Accra', coordinates: { latitude: 5.5735, longitude: -0.2007 } },
      { name: 'Tema', coordinates: { latitude: 5.6698, longitude: -0.0166 } },
      
      // Kumasi areas
      { name: 'Asokwa, Kumasi', coordinates: { latitude: 6.6885, longitude: -1.6244 } },
      { name: 'Adum, Kumasi', coordinates: { latitude: 6.6959, longitude: -1.6143 } },
      { name: 'KNUST, Kumasi', coordinates: { latitude: 6.6745, longitude: -1.5716 } },
      
      // Other major cities
      { name: 'Takoradi', coordinates: { latitude: 4.8845, longitude: -1.7554 } },
      { name: 'Cape Coast', coordinates: { latitude: 5.1053, longitude: -1.2466 } },
      { name: 'Tamale', coordinates: { latitude: 9.4008, longitude: -0.8393 } },
    ];
  }

  // Get Ghana delivery zones for compatibility
  getGhanaDeliveryZones() {
    return this.getPopularDeliveryAreas();
  }

  // Check if delivery is available in the area
  isDeliveryAvailable(coordinates: LocationCoordinates): boolean {
    if (!this.isLocationInGhana(coordinates)) {
      return false;
    }

    const deliveryAreas = this.getPopularDeliveryAreas();
    
    // Check if location is within 10km of any delivery area
    return deliveryAreas.some(area => 
      this.calculateDistance(coordinates, area.coordinates) <= 10
    );
  }

  // Format location for display
  formatLocationDisplay(location: GhanaLocation): string {
    if (location.address) {
      const parts = [];
      if (location.address.name) parts.push(location.address.name);
      if (location.address.street) parts.push(location.address.street);
      if (location.address.city) parts.push(location.address.city);
      if (location.address.region) parts.push(location.address.region);
      
      return parts.join(', ') || 'Current Location';
    }
    
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  // Get estimated delivery time based on distance
  getEstimatedDeliveryTime(
    restaurantLocation: LocationCoordinates,
    deliveryLocation: LocationCoordinates
  ): string {
    const distance = this.calculateDistance(restaurantLocation, deliveryLocation);
    
    if (distance <= 2) return '15-25 mins';
    if (distance <= 5) return '25-35 mins';
    if (distance <= 10) return '35-50 mins';
    return '50+ mins';
  }

  // Get delivery fee based on distance
  getDeliveryFee(
    restaurantLocation: LocationCoordinates,
    deliveryLocation: LocationCoordinates
  ): number {
    const distance = this.calculateDistance(restaurantLocation, deliveryLocation);
    
    if (distance <= 2) return 2; // GHS 2
    if (distance <= 5) return 5; // GHS 5
    if (distance <= 10) return 8; // GHS 8
    return 12; // GHS 12 for longer distances
  }
}

export const locationService = new LocationService();