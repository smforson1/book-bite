import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../components';
import LocationPicker from '../../components/LocationPicker';
import AddressInput from '../../components/AddressInput';
import { theme } from '../../styles/theme';
import { locationService, UserLocation } from '../../services/locationService';

interface DeliveryAddress {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
  streetAddress?: string;
  apartmentNumber?: string;
  floor?: string;
  buildingName?: string;
  landmark?: string;
  deliveryInstructions?: string;
  contactPhone?: string;
  label?: string;
}

const LocationTestScreen: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);

  const handleGetCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        Alert.alert('Success', 'Current location retrieved successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleLocationSelect = (location: UserLocation) => {
    setSelectedLocation(location);
  };

  const handleAddressSelect = (address: DeliveryAddress) => {
    setDeliveryAddress(address);
  };

  const calculateDistance = () => {
    if (currentLocation && selectedLocation) {
      const distance = locationService.calculateDistance(
        currentLocation.coordinates,
        selectedLocation.coordinates
      );
      Alert.alert(
        'Distance Calculation',
        `Distance between current location and selected location: ${distance.toFixed(2)} km`
      );
    } else {
      Alert.alert('Error', 'Please get current location and select a location first');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location System Test</Text>
        <Text style={styles.headerSubtitle}>Test the enhanced location features</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location Test */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <Button
            title="Get Current Location"
            onPress={handleGetCurrentLocation}
            style={styles.testButton}
          />
          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{currentLocation.address.formattedAddress}</Text>
              <Text style={styles.infoLabel}>Coordinates:</Text>
              <Text style={styles.infoValue}>
                {currentLocation.coordinates.latitude.toFixed(6)}, {currentLocation.coordinates.longitude.toFixed(6)}
              </Text>
              {currentLocation.accuracy && (
                <>
                  <Text style={styles.infoLabel}>Accuracy:</Text>
                  <Text style={styles.infoValue}>
                    {locationService.getAccuracyDescription(currentLocation.accuracy)} ({currentLocation.accuracy.toFixed(1)}m)
                  </Text>
                </>
              )}
            </View>
          )}
        </Card>

        {/* Location Picker Test */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Location Picker</Text>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            placeholder="Test location selection"
            showSavedLocations={true}
            allowCurrentLocation={true}
            allowMapSelection={true}
          />
          {selectedLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.infoLabel}>Selected Address:</Text>
              <Text style={styles.infoValue}>{selectedLocation.address.formattedAddress}</Text>
              <Text style={styles.infoLabel}>Coordinates:</Text>
              <Text style={styles.infoValue}>
                {selectedLocation.coordinates.latitude.toFixed(6)}, {selectedLocation.coordinates.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </Card>

        {/* Address Input Test */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Address Input</Text>
          <AddressInput
            onAddressSelect={handleAddressSelect}
            placeholder="Test detailed address input"
            required={false}
          />
          {deliveryAddress && (
            <View style={styles.locationInfo}>
              <Text style={styles.infoLabel}>Delivery Address:</Text>
              <Text style={styles.infoValue}>{deliveryAddress.formattedAddress}</Text>
              {deliveryAddress.streetAddress && (
                <>
                  <Text style={styles.infoLabel}>Street:</Text>
                  <Text style={styles.infoValue}>{deliveryAddress.streetAddress}</Text>
                </>
              )}
              {deliveryAddress.deliveryInstructions && (
                <>
                  <Text style={styles.infoLabel}>Instructions:</Text>
                  <Text style={styles.infoValue}>{deliveryAddress.deliveryInstructions}</Text>
                </>
              )}
              {deliveryAddress.contactPhone && (
                <>
                  <Text style={styles.infoLabel}>Contact:</Text>
                  <Text style={styles.infoValue}>{deliveryAddress.contactPhone}</Text>
                </>
              )}
            </View>
          )}
        </Card>

        {/* Distance Calculation Test */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Distance Calculation</Text>
          <Text style={styles.sectionDescription}>
            Get current location and select a location to calculate distance
          </Text>
          <Button
            title="Calculate Distance"
            onPress={calculateDistance}
            disabled={!currentLocation || !selectedLocation}
            style={styles.testButton}
          />
        </Card>

        {/* Location Validation Test */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Location Validation</Text>
          {selectedLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.infoLabel}>Is in Ghana:</Text>
              <Text style={[
                styles.infoValue,
                locationService.isLocationInGhana(selectedLocation.coordinates) 
                  ? styles.successText 
                  : styles.errorText
              ]}>
                {locationService.isLocationInGhana(selectedLocation.coordinates) ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.infoLabel}>Ghana Region:</Text>
              <Text style={styles.infoValue}>
                {locationService.getGhanaRegion(selectedLocation.coordinates)}
              </Text>
            </View>
          )}
          {!selectedLocation && (
            <Text style={styles.placeholderText}>Select a location to test validation</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  testButton: {
    backgroundColor: theme.colors.primary[500],
    marginBottom: theme.spacing.md,
  },
  locationInfo: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  successText: {
    color: theme.colors.success[600],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  errorText: {
    color: theme.colors.error[600],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});

export default LocationTestScreen;