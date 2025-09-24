import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';

import { theme } from '../styles/theme';
import { locationService, LocationCoordinates, UserLocation, SavedLocation } from '../services/locationService';

interface LocationPickerProps {
  onLocationSelect: (location: UserLocation) => void;
  initialLocation?: UserLocation;
  placeholder?: string;
  showSavedLocations?: boolean;
  allowCurrentLocation?: boolean;
  allowMapSelection?: boolean;
  style?: any;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Select delivery location",
  showSavedLocations = true,
  allowCurrentLocation = true,
  allowMapSelection = true,
  style,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(initialLocation || null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<UserLocation[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 5.6037, // Accra, Ghana
    longitude: -0.1870,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    // In a real app, you'd load this from AsyncStorage or API
    const mockSavedLocations: SavedLocation[] = [
      {
        id: '1',
        name: 'Home',
        type: 'home',
        coordinates: { latitude: 5.6037, longitude: -0.1870 },
        address: { formattedAddress: 'Accra, Ghana' },
        isDefault: true,
      },
      {
        id: '2',
        name: 'Work',
        type: 'work',
        coordinates: { latitude: 5.5560, longitude: -0.1969 },
        address: { formattedAddress: 'Tema, Ghana' },
      },
    ];
    setSavedLocations(mockSavedLocations);
  };

  const handleCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setSelectedLocation(location);
        onLocationSelect(location);
        setShowModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get your current location');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchLocation = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const coordinates = await locationService.geocodeAddress(query);
      const results: UserLocation[] = [];

      for (const coord of coordinates.slice(0, 5)) { // Limit to 5 results
        const address = await locationService.reverseGeocode(coord);
        results.push({
          coordinates: coord,
          address,
          timestamp: Date.now(),
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleMapLocationSelect = (coordinate: LocationCoordinates) => {
    locationService.reverseGeocode(coordinate).then((address) => {
      const location: UserLocation = {
        coordinates: coordinate,
        address,
        timestamp: Date.now(),
      };
      setSelectedLocation(location);
    });
  };

  const handleSavedLocationSelect = (savedLocation: SavedLocation) => {
    const location: UserLocation = {
      coordinates: savedLocation.coordinates,
      address: savedLocation.address,
      timestamp: Date.now(),
    };
    setSelectedLocation(location);
    onLocationSelect(location);
    setShowModal(false);
  };

  const renderLocationOption = (location: UserLocation, title?: string, icon?: string) => (
    <TouchableOpacity
      style={styles.locationOption}
      onPress={() => {
        setSelectedLocation(location);
        onLocationSelect(location);
        setShowModal(false);
      }}
    >
      <View style={styles.locationOptionLeft}>
        <Ionicons 
          name={icon as any || 'location'} 
          size={20} 
          color={theme.colors.primary[500]} 
        />
        <View style={styles.locationInfo}>
          {title && <Text style={styles.locationTitle}>{title}</Text>}
          <Text style={styles.locationAddress}>
            {location.address.formattedAddress}
          </Text>
          {location.accuracy && (
            <Text style={styles.locationAccuracy}>
              {locationService.getAccuracyDescription(location.accuracy)}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.locationButtonContent}>
          <Ionicons name="location" size={20} color={theme.colors.primary[500]} />
          <Text style={styles.locationButtonText}>
            {selectedLocation?.address.formattedAddress || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for an address..."
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  handleSearchLocation(text);
                }}
              />
            </View>

            {/* Current Location */}
            {allowCurrentLocation && (
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={handleCurrentLocation}
                disabled={loading}
              >
                <View style={styles.locationOptionLeft}>
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                  ) : (
                    <Ionicons name="locate" size={20} color={theme.colors.primary[500]} />
                  )}
                  <Text style={styles.currentLocationText}>Use Current Location</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}

            {/* Map Selection */}
            {allowMapSelection && (
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setShowMap(true)}
              >
                <View style={styles.locationOptionLeft}>
                  <Ionicons name="map" size={20} color={theme.colors.primary[500]} />
                  <Text style={styles.mapButtonText}>Choose on Map</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {searchResults.map((location, index) => (
                  <View key={index}>
                    {renderLocationOption(location, undefined, 'search')}
                  </View>
                ))}
              </View>
            )}

            {/* Saved Locations */}
            {showSavedLocations && savedLocations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saved Locations</Text>
                {savedLocations.map((savedLocation) => (
                  <TouchableOpacity
                    key={savedLocation.id}
                    style={styles.locationOption}
                    onPress={() => handleSavedLocationSelect(savedLocation)}
                  >
                    <View style={styles.locationOptionLeft}>
                      <Ionicons 
                        name={savedLocation.type === 'home' ? 'home' : savedLocation.type === 'work' ? 'business' : 'location'} 
                        size={20} 
                        color={theme.colors.primary[500]} 
                      />
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>{savedLocation.name}</Text>
                        <Text style={styles.locationAddress}>
                          {savedLocation.address.formattedAddress}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Map Modal */}
        <Modal
          visible={showMap}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <View style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <TouchableOpacity onPress={() => setShowMap(false)}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.mapTitle}>Choose Location</Text>
              <TouchableOpacity
                onPress={() => {
                  if (selectedLocation) {
                    onLocationSelect(selectedLocation);
                    setShowMap(false);
                    setShowModal(false);
                  }
                }}
              >
                <Text style={styles.mapDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={(event) => {
                handleMapLocationSelect(event.nativeEvent.coordinate);
              }}
            >
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation.coordinates}
                  title="Selected Location"
                  description={selectedLocation.address.formattedAddress}
                />
              )}
            </MapView>

            <View style={styles.mapInfo}>
              <Text style={styles.mapInfoText}>
                {selectedLocation?.address.formattedAddress || 'Tap on the map to select a location'}
              </Text>
            </View>
          </View>
        </Modal>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  currentLocationText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary[600],
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  mapButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  locationOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationInfo: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  locationTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  locationAccuracy: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  mapTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  mapDoneButton: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary[500],
  },
  map: {
    flex: 1,
  },
  mapInfo: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  mapInfoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default LocationPicker;