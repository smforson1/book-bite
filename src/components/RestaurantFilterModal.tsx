import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from './index';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

interface RestaurantFilters {
  cuisine?: string[];
  minRating?: number;
  maxDeliveryTime?: number;
  maxDeliveryFee?: number;
  location?: string;
}

interface RestaurantFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: RestaurantFilters) => void;
  currentFilters: RestaurantFilters;
}

const RestaurantFilterModal: React.FC<RestaurantFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<RestaurantFilters>(currentFilters);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    currentFilters.cuisine || []
  );

  const cuisineTypes = [
    'Italian',
    'Chinese',
    'Japanese',
    'Mexican',
    'American',
    'Indian',
    'Thai',
    'French',
    'Mediterranean',
    'Korean',
    'Vietnamese',
    'Greek',
    'Spanish',
    'Middle Eastern',
    'Fast Food',
    'Sushi',
    'Pizza',
    'Burgers',
    'Asian',
    'Latin American',
  ];

  const ratings = [5, 4, 3, 2, 1];

  const deliveryTimes = [
    { label: 'Under 20 mins', max: 20 },
    { label: 'Under 30 mins', max: 30 },
    { label: 'Under 45 mins', max: 45 },
    { label: 'Under 60 mins', max: 60 },
  ];

  const deliveryFees = [
    { label: 'Free Delivery', max: 0 },
    { label: 'Under $3', max: 3 },
    { label: 'Under $5', max: 5 },
    { label: 'Under $10', max: 10 },
  ];

  const toggleCuisine = (cuisine: string) => {
    const updated = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter(c => c !== cuisine)
      : [...selectedCuisines, cuisine];
    setSelectedCuisines(updated);
    setFilters({ ...filters, cuisine: updated });
  };

  const selectRating = (rating: number) => {
    setFilters({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    });
  };

  const selectDeliveryTime = (maxTime: number) => {
    setFilters({
      ...filters,
      maxDeliveryTime: filters.maxDeliveryTime === maxTime ? undefined : maxTime,
    });
  };

  const selectDeliveryFee = (maxFee: number) => {
    setFilters({
      ...filters,
      maxDeliveryFee: filters.maxDeliveryFee === maxFee ? undefined : maxFee,
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedCuisines([]);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Restaurants</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cuisine Type */}
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Cuisine Type</Text>
            <View style={styles.cuisineGrid}>
              {cuisineTypes.map((cuisine) => {
                const isSelected = selectedCuisines.includes(cuisine);
                return (
                  <TouchableOpacity
                    key={cuisine}
                    style={[styles.cuisineChip, isSelected && styles.selectedCuisineChip]}
                    onPress={() => toggleCuisine(cuisine)}
                  >
                    <Text style={[styles.cuisineText, isSelected && styles.selectedCuisineText]}>
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Rating */}
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Minimum Rating</Text>
            {ratings.map((rating) => {
              const isSelected = filters.minRating === rating;
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

          {/* Delivery Time */}
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Delivery Time</Text>
            {deliveryTimes.map((timeOption, index) => {
              const isSelected = filters.maxDeliveryTime === timeOption.max;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionRow, isSelected && styles.selectedOption]}
                  onPress={() => selectDeliveryTime(timeOption.max)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {timeOption.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Delivery Fee */}
          <Card style={styles.section}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>Delivery Fee</Text>
            {deliveryFees.map((feeOption, index) => {
              const isSelected = filters.maxDeliveryFee === feeOption.max;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionRow, isSelected && styles.selectedOption]}
                  onPress={() => selectDeliveryFee(feeOption.max)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {feeOption.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              );
            })}
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
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  cuisineChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCuisineChip: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  cuisineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  selectedCuisineText: {
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

export default RestaurantFilterModal;