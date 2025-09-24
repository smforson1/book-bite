import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationPicker from './LocationPicker';
import { Button } from './Button';
import { theme } from '../styles/theme';
import { UserLocation } from '../services/locationService';

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

interface AddressInputProps {
  onAddressSelect: (address: DeliveryAddress) => void;
  placeholder?: string;
  required?: boolean;
  style?: any;
}

const AddressInput: React.FC<AddressInputProps> = ({
  onAddressSelect,
  placeholder = "Enter delivery address",
  required = false,
  style,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    streetAddress: '',
    apartmentNumber: '',
    floor: '',
    buildingName: '',
    landmark: '',
    deliveryInstructions: '',
    contactPhone: '',
    label: '',
  });

  const handleLocationSelect = (location: UserLocation) => {
    setSelectedLocation(location);
    setShowDetailForm(true);
  };

  const handleSaveAddress = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location first');
      return;
    }

    if (required && !addressDetails.streetAddress.trim()) {
      Alert.alert('Required Field', 'Please enter a street address');
      return;
    }

    const deliveryAddress: DeliveryAddress = {
      coordinates: selectedLocation.coordinates,
      formattedAddress: selectedLocation.address.formattedAddress || 'Unknown location',
      streetAddress: addressDetails.streetAddress.trim() || undefined,
      apartmentNumber: addressDetails.apartmentNumber.trim() || undefined,
      floor: addressDetails.floor.trim() || undefined,
      buildingName: addressDetails.buildingName.trim() || undefined,
      landmark: addressDetails.landmark.trim() || undefined,
      deliveryInstructions: addressDetails.deliveryInstructions.trim() || undefined,
      contactPhone: addressDetails.contactPhone.trim() || undefined,
      label: addressDetails.label.trim() || undefined,
    };

    onAddressSelect(deliveryAddress);
    setShowDetailForm(false);
  };

  const resetForm = () => {
    setAddressDetails({
      streetAddress: '',
      apartmentNumber: '',
      floor: '',
      buildingName: '',
      landmark: '',
      deliveryInstructions: '',
      contactPhone: '',
      label: '',
    });
  };

  return (
    <View style={[styles.container, style]}>
      <LocationPicker
        onLocationSelect={handleLocationSelect}
        placeholder={placeholder}
        showSavedLocations={true}
        allowCurrentLocation={true}
        allowMapSelection={true}
      />

      {/* Address Details Modal */}
      <Modal
        visible={showDetailForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowDetailForm(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Address Details</Text>
            <TouchableOpacity onPress={handleSaveAddress}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Selected Location Display */}
            {selectedLocation && (
              <View style={styles.selectedLocationCard}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color={theme.colors.primary[500]} />
                  <Text style={styles.locationTitle}>Selected Location</Text>
                </View>
                <Text style={styles.locationAddress}>
                  {selectedLocation.address.formattedAddress}
                </Text>
                <Text style={styles.locationCoords}>
                  {selectedLocation.coordinates.latitude.toFixed(6)}, {selectedLocation.coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {/* Address Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Delivery Address Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Street Address {required && <Text style={styles.required}>*</Text>}
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 123 Main Street"
                  value={addressDetails.streetAddress}
                  onChangeText={(text) => setAddressDetails(prev => ({ ...prev, streetAddress: text }))}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Apartment/Unit</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Apt 4B"
                    value={addressDetails.apartmentNumber}
                    onChangeText={(text) => setAddressDetails(prev => ({ ...prev, apartmentNumber: text }))}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Floor</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 2nd Floor"
                    value={addressDetails.floor}
                    onChangeText={(text) => setAddressDetails(prev => ({ ...prev, floor: text }))}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Building Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Sunrise Apartments"
                  value={addressDetails.buildingName}
                  onChangeText={(text) => setAddressDetails(prev => ({ ...prev, buildingName: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nearby Landmark</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Near City Mall"
                  value={addressDetails.landmark}
                  onChangeText={(text) => setAddressDetails(prev => ({ ...prev, landmark: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Instructions</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g., Ring doorbell twice, leave at door"
                  value={addressDetails.deliveryInstructions}
                  onChangeText={(text) => setAddressDetails(prev => ({ ...prev, deliveryInstructions: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., +233 24 123 4567"
                  value={addressDetails.contactPhone}
                  onChangeText={(text) => setAddressDetails(prev => ({ ...prev, contactPhone: text }))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Save as (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Home, Work, Mom's House"
                  value={addressDetails.label}
                  onChangeText={(text) => setAddressDetails(prev => ({ ...prev, label: text }))}
                />
              </View>
            </View>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={16} color={theme.colors.warning[500]} />
                <Text style={styles.tipTitle}>Delivery Tips</Text>
              </View>
              <Text style={styles.tipText}>
                • Provide clear delivery instructions to help our delivery partner find you
              </Text>
              <Text style={styles.tipText}>
                • Include landmarks or building names for easier navigation
              </Text>
              <Text style={styles.tipText}>
                • Make sure your contact phone is reachable during delivery
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Save Address"
              onPress={handleSaveAddress}
              style={styles.saveAddressButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
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
  saveButton: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary[500],
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  selectedLocationCard: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary[700],
    marginLeft: theme.spacing.sm,
  },
  locationAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
  },
  locationCoords: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[500],
    fontFamily: 'monospace',
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error[500],
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  tipsSection: {
    backgroundColor: theme.colors.warning[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tipTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.warning[700],
    marginLeft: theme.spacing.sm,
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[600],
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  saveAddressButton: {
    backgroundColor: theme.colors.primary[500],
  },
});

export default AddressInput;