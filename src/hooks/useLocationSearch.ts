import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationCoordinates } from '../services/locationService';
import { googleMapsService, GhanaLocation } from '../services/googleMapsService';

interface LocationSearchResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  sortByDistance: (items: T[], locationField: keyof T) => Promise<T[]>;
  calculateDistance: (itemLocation: LocationCoordinates, userLocation: LocationCoordinates) => number;
}

interface LocationSearchOptions {
  enableLocationSearch?: boolean;
  maxDistance?: number; // in kilometers
}

export function useLocationSearch<T>(options: LocationSearchOptions = {}): LocationSearchResult<T> {
  const { enableLocationSearch = true, maxDistance = 50 } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);

  // Get user's current location
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!enableLocationSearch) return;
      
      try {
        setLoading(true);
        const location = await locationService.getCurrentLocation();
        if (location) {
          setUserLocation(location.coordinates);
        }
      } catch (err) {
        setError('Failed to get your location');
        console.error('Location error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocation();
  }, [enableLocationSearch]);

  // Calculate distance between two coordinates (in kilometers)
  const calculateDistance = useCallback((itemLocation: LocationCoordinates, userLocation: LocationCoordinates): number => {
    return locationService.calculateDistance(itemLocation, userLocation);
  }, []);

  // Sort items by distance from user's location
  const sortByDistance = useCallback(async (items: T[], locationField: keyof T): Promise<T[]> => {
    if (!enableLocationSearch || !userLocation || items.length === 0) {
      return items;
    }

    try {
      setLoading(true);
      
      // Create array of items with distances
      const itemsWithDistance = await Promise.all(
        items.map(async (item) => {
          try {
            const address = item[locationField] as string;
            if (!address) return { item, distance: Infinity };
            
            // Geocode the item's address to get coordinates
            const coordinates = await googleMapsService.geocodeAddress(address);
            if (coordinates) {
              const itemCoords = { latitude: coordinates.latitude, longitude: coordinates.longitude };
              const distance = calculateDistance(itemCoords, userLocation);
              return { item, distance };
            }
            return { item, distance: Infinity };
          } catch (err) {
            console.error('Error geocoding item address:', err);
            return { item, distance: Infinity };
          }
        })
      );

      // Filter by max distance if specified
      const filteredItems = maxDistance 
        ? itemsWithDistance.filter(({ distance }) => distance <= maxDistance)
        : itemsWithDistance;

      // Sort by distance (closest first)
      const sortedItems = filteredItems
        .sort((a, b) => a.distance - b.distance)
        .map(({ item }) => item);

      return sortedItems;
    } catch (err) {
      setError('Failed to sort items by distance');
      console.error('Sorting error:', err);
      return items;
    } finally {
      setLoading(false);
    }
  }, [enableLocationSearch, userLocation, maxDistance, calculateDistance]);

  return {
    items: [] as T[], // This will be populated by the calling component
    loading,
    error,
    sortByDistance,
    calculateDistance
  };
}