import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from './index';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

interface HotelFilters {
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  rating?: number;
  location?: string;
}

interface HotelFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: HotelFilters) => void;
  currentFilters: HotelFilters;
}

const HotelFilterModal: React.FC<HotelFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<HotelFilters>(currentFilters);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    currentFilters.amenities || []
  );

  const priceRanges = [
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200 - $300', min: 200, max: 300 },
    { label: '$300 - $500', min: 300, max: 500 },
    { label: 'Over $500', min: 500, max: 9999 },
  ];

  const ratings = [5, 4, 3, 2, 1];

  const amenitiesList = [
    'WiFi',
    'Pool',
    'Spa',
    'Gym',
    'Restaurant',
    'Bar',
    'Room Service',
    'Concierge',
    'Beach Access',
    'Parking',
    'Business Center',
    'Meeting Rooms',
    'Fireplace',
    'Hiking Trails',
    'Game Room',
  ];

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    setFilters({ ...filters, amenities: updated });
  };

  const selectPriceRange = (range: { min: number; max: number }) => {
    setFilters({
      ...filters,
      minPrice: range.min,
      maxPrice: range.max === 9999 ? undefined : range.max,
    });
  };

  const selectRating = (rating: number) => {
    setFilters({
      ...filters,
      rating: filters.rating === rating ? undefined : rating,
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedAmenities([]);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const getSelectedPriceRange = () => {
    return priceRanges.find(
      range =>
        range.min === filters.minPrice &&
        (range.max === filters.maxPrice || (range.max === 9999 && !filters.maxPrice))
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Hotels</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Price Range</Text>
            {priceRanges.map((range, index) => {
              const isSelected = getSelectedPriceRange()?.label === range.label;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionRow, isSelected && styles.selectedOption]}
                  onPress={() => selectPriceRange(range)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {range.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Rating */}
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Minimum Rating</Text>
            {ratings.map((rating) => {
              const isSelected = filters.rating === rating;
              return (
                <TouchableOpacity
                  key={rating}
                  style={[styles.optionRow, isSelected && styles.selectedOption]}
                  onPress={() => selectRating(rating)}
                >
                  <View style={styles.ratingRow}>
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {rating} Stars & Above
                    </Text>
                    <View style={styles.stars}>
                      {[...Array(rating)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={16}
                          color={theme.colors.warning[500]}
                        />
                      ))}
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Amenities */}
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {amenitiesList.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <TouchableOpacity
                    key={amenity}
                    style={[styles.amenityChip, isSelected && styles.selectedAmenityChip]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text style={[styles.amenityText, isSelected && styles.selectedAmenityText]}>
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Apply Filters" onPress={applyFilters} style={styles.applyButton} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  clearText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary[50],
  },
  optionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  selectedOptionText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    marginLeft: theme.spacing.sm,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  amenityChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedAmenityChip: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  amenityText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  selectedAmenityText: {
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  applyButton: {
    width: '100%',
  },
});

export default HotelFilterModal;