import * as Location from 'expo-location';
import { locationService } from './locationService';

export interface GhanaLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: RouteStep[];
  polyline: string;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  startLocation: GhanaLocation;
  endLocation: GhanaLocation;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  location: GhanaLocation;
  rating?: number;
  priceLevel?: number;
  types: string[];
  openNow?: boolean;
  photos?: string[];
}

export interface GhanaDeliveryEstimate {
  estimatedTime: string;
  distance: string;
  traffic: 'light' | 'moderate' | 'heavy';
  deliveryFee: number;
  isWithinRange: boolean;
  route?: RouteInfo;
}

class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';
  private ghanaRegions: string[] = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo'
  ];

  constructor() {
    // In production, this would be stored securely
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key';
  }

  // Geocode address to coordinates (Ghana-specific)
  async geocodeAddress(address: string): Promise<GhanaLocation | null> {
    try {
      // Append "Ghana" to ensure we get Ghana-specific results
      const searchAddress = address.includes('Ghana') ? address : `${address}, Ghana`;
      
      const response = await fetch(
        `${this.baseUrl}/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${this.apiKey}&region=gh`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location: GhanaLocation = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
        };

        // Extract Ghana-specific address components
        const components = result.address_components;
        for (const component of components) {
          if (component.types.includes('locality')) {
            location.city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            location.region = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            location.postalCode = component.long_name;
          }
        }

        // Validate that the location is within Ghana
        if (locationService.isLocationInGhana(location)) {
          return location;
        } else {
          console.warn('Geocoded location is outside Ghana:', location);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to address (Ghana context)
  async reverseGeocode(latitude: number, longitude: number): Promise<GhanaLocation | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}&region=gh`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        // Prefer results that mention Ghana
        const ghanaResult = data.results.find((r: any) => 
          r.formatted_address.includes('Ghana')
        ) || result;

        const location: GhanaLocation = {
          latitude,
          longitude,
          address: ghanaResult.formatted_address,
        };

        // Extract address components
        const components = ghanaResult.address_components;
        for (const component of components) {
          if (component.types.includes('locality')) {
            location.city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            location.region = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            location.postalCode = component.long_name;
          }
        }

        return location;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Get route between two points in Ghana
  async getRoute(origin: GhanaLocation, destination: GhanaLocation): Promise<RouteInfo | null> {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destStr = `${destination.latitude},${destination.longitude}`;
      
      const response = await fetch(
        `${this.baseUrl}/directions/json?origin=${originStr}&destination=${destStr}&key=${this.apiKey}&region=gh&units=metric`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        const routeInfo: RouteInfo = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          polyline: route.overview_polyline.points,
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
            distance: step.distance.text,
            duration: step.duration.text,
            startLocation: {
              latitude: step.start_location.lat,
              longitude: step.start_location.lng,
            },
            endLocation: {
              latitude: step.end_location.lat,
              longitude: step.end_location.lng,
            },
          })),
        };
        
        return routeInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Route calculation error:', error);
      return null;
    }
  }

  // Search for places in Ghana (restaurants, hotels, etc.)
  async searchPlaces(query: string, location: GhanaLocation, radius: number = 5000): Promise<PlaceResult[]> {
    try {
      const locationStr = `${location.latitude},${location.longitude}`;
      
      const response = await fetch(
        `${this.baseUrl}/place/nearbysearch/json?location=${locationStr}&radius=${radius}&keyword=${encodeURIComponent(query)}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        const places: PlaceResult[] = data.results.map((place: any) => ({
          placeId: place.place_id,
          name: place.name,
          address: place.vicinity,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          rating: place.rating,
          priceLevel: place.price_level,
          types: place.types,
          openNow: place.opening_hours?.open_now,
          photos: place.photos?.map((photo: any) => 
            `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
          ),
        }));
        
        return places;
      }
      
      return [];
    } catch (error) {
      console.error('Place search error:', error);
      return [];
    }
  }

  // Get detailed place information
  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/place/details/json?place_id=${placeId}&key=${this.apiKey}&fields=name,formatted_address,geometry,rating,price_level,opening_hours,photos,types,formatted_phone_number,website`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        const place = data.result;
        
        return {
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          rating: place.rating,
          priceLevel: place.price_level,
          types: place.types,
          openNow: place.opening_hours?.open_now,
          photos: place.photos?.map((photo: any) => 
            `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
          ),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  }

  // Calculate delivery estimate for Ghana
  async calculateDeliveryEstimate(
    restaurantLocation: GhanaLocation,
    deliveryLocation: GhanaLocation
  ): Promise<GhanaDeliveryEstimate> {
    try {
      // Check if both locations are in Ghana
      if (!locationService.isLocationInGhana(restaurantLocation) || 
          !locationService.isLocationInGhana(deliveryLocation)) {
        return {
          estimatedTime: 'N/A',
          distance: 'N/A',
          traffic: 'moderate',
          deliveryFee: 0,
          isWithinRange: false,
        };
      }

      const route = await this.getRoute(restaurantLocation, deliveryLocation);
      
      if (!route) {
        // Fallback to straight-line distance calculation
        const distance = this.calculateDistance(restaurantLocation, deliveryLocation);
        return {
          estimatedTime: distance > 20 ? 'Over 60 mins' : '30-45 mins',
          distance: `${distance.toFixed(1)} km`,
          traffic: 'moderate',
          deliveryFee: this.calculateDeliveryFee(distance),
          isWithinRange: distance <= 25, // 25km max delivery range for Ghana
        };
      }

      // Parse distance from route
      const distanceKm = parseFloat(route.distance.replace(/[^\d.]/g, ''));
      const durationMins = this.parseDuration(route.duration);
      
      // Ghana-specific traffic adjustments
      const traffic = this.estimateTraffic(restaurantLocation, deliveryLocation);
      const adjustedDuration = this.adjustForGhanaTraffic(durationMins, traffic);
      
      return {
        estimatedTime: `${adjustedDuration}-${adjustedDuration + 15} mins`,
        distance: route.distance,
        traffic,
        deliveryFee: this.calculateDeliveryFee(distanceKm),
        isWithinRange: distanceKm <= 25,
        route,
      };
    } catch (error) {
      console.error('Delivery estimation error:', error);
      return {
        estimatedTime: '30-45 mins',
        distance: 'Unknown',
        traffic: 'moderate',
        deliveryFee: 10,
        isWithinRange: true,
      };
    }
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(point1: GhanaLocation, point2: GhanaLocation): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Parse duration string to minutes
  private parseDuration(duration: string): number {
    const hours = duration.match(/(\d+)\s*hour/i);
    const minutes = duration.match(/(\d+)\s*min/i);
    
    let totalMinutes = 0;
    if (hours) totalMinutes += parseInt(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);
    
    return totalMinutes || 30; // Default 30 minutes
  }

  // Estimate traffic conditions in Ghana
  private estimateTraffic(origin: GhanaLocation, destination: GhanaLocation): 'light' | 'moderate' | 'heavy' {
    const hour = new Date().getHours();
    
    // Check if in major traffic areas (Accra, Kumasi)
    const isAccra = (origin.city?.includes('Accra') || destination.city?.includes('Accra'));
    const isKumasi = (origin.city?.includes('Kumasi') || destination.city?.includes('Kumasi'));
    
    // Ghana rush hours: 7-9 AM, 5-7 PM
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    
    if (isRushHour && (isAccra || isKumasi)) {
      return 'heavy';
    } else if (isRushHour || (isAccra || isKumasi)) {
      return 'moderate';
    } else {
      return 'light';
    }
  }

  // Adjust delivery time for Ghana traffic conditions
  private adjustForGhanaTraffic(baseDuration: number, traffic: 'light' | 'moderate' | 'heavy'): number {
    switch (traffic) {
      case 'heavy':
        return Math.round(baseDuration * 1.5); // 50% longer in heavy traffic
      case 'moderate':
        return Math.round(baseDuration * 1.25); // 25% longer in moderate traffic
      case 'light':
      default:
        return baseDuration;
    }
  }

  // Calculate delivery fee based on distance (Ghana pricing)
  private calculateDeliveryFee(distanceKm: number): number {
    // Ghana-specific delivery pricing in GHS
    if (distanceKm <= 5) return 8; // GHS 8 for up to 5km
    if (distanceKm <= 10) return 12; // GHS 12 for up to 10km
    if (distanceKm <= 20) return 18; // GHS 18 for up to 20km
    return 25; // GHS 25 for longer distances
  }

  // Get Ghana major cities and their coordinates
  getGhanaMajorCities(): { [key: string]: GhanaLocation } {
    return {
      accra: {
        latitude: 5.6037,
        longitude: -0.1870,
        city: 'Accra',
        region: 'Greater Accra',
      },
      kumasi: {
        latitude: 6.6885,
        longitude: -1.6244,
        city: 'Kumasi',
        region: 'Ashanti',
      },
      takoradi: {
        latitude: 4.8845,
        longitude: -1.7554,
        city: 'Takoradi',
        region: 'Western',
      },
      cape_coast: {
        latitude: 5.1054,
        longitude: -1.2466,
        city: 'Cape Coast',
        region: 'Central',
      },
      tamale: {
        latitude: 9.4008,
        longitude: -0.8393,
        city: 'Tamale',
        region: 'Northern',
      },
      koforidua: {
        latitude: 6.0898,
        longitude: -0.2599,
        city: 'Koforidua',
        region: 'Eastern',
      },
    };
  }

  // Get delivery areas for a specific city
  getDeliveryAreas(city: string): string[] {
    const areas = locationService.getGhanaDeliveryZones();
    const cityKey = city.toLowerCase().replace(/\s+/g, '_');
    return (areas as any)[cityKey]?.zones || [];
  }

  // Check if current location is optimal for service
  async checkServiceAvailability(location: GhanaLocation): Promise<{
    available: boolean;
    message: string;
    nearestCity?: string;
    estimatedExpansion?: string;
  }> {
    const cities = this.getGhanaMajorCities();
    
    // Check if within any major city (30km radius)
    for (const [cityKey, cityLocation] of Object.entries(cities)) {
      const distance = this.calculateDistance(location, cityLocation);
      if (distance <= 30) {
        return {
          available: true,
          message: `Service available in ${cityLocation.city}`,
          nearestCity: cityLocation.city,
        };
      }
    }

    // Find nearest city
    let nearestCity = '';
    let minDistance = Infinity;
    for (const [cityKey, cityLocation] of Object.entries(cities)) {
      const distance = this.calculateDistance(location, cityLocation);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = cityLocation.city!;
      }
    }

    return {
      available: false,
      message: `Service not yet available in your area. Nearest service: ${nearestCity} (${minDistance.toFixed(1)}km away)`,
      nearestCity,
      estimatedExpansion: '2024 Q4', // Placeholder for service expansion
    };
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
export default googleMapsService;