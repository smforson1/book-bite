import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, RestaurantFilterModal } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Restaurant } from '../../types';

interface RestaurantsScreenProps {
  navigation: any;
}

interface RestaurantFilters {
  cuisine?: string[];
  minRating?: number;
  maxDeliveryTime?: number;
  maxDeliveryFee?: number;
  location?: string;
}

const RestaurantsScreen: React.FC<RestaurantsScreenProps> = ({ navigation }) => {
  const { restaurants, loading, getRestaurants, searchRestaurants } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RestaurantFilters>({});

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = searchRestaurants(searchQuery, activeFilters);
      setFilteredRestaurants(searchResults);
    } else {
      // Apply filters without search
      const filtered = applyFiltersToRestaurants(restaurants, activeFilters);
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants, activeFilters]);

  const applyFiltersToRestaurants = (restaurantList: Restaurant[], filters: RestaurantFilters) => {
    let filtered = [...restaurantList];

    if (filters.minRating) {
      filtered = filtered.filter(restaurant => restaurant.rating >= filters.minRating!);
    }

    if (filters.maxDeliveryFee !== undefined) {
      filtered = filtered.filter(restaurant => restaurant.deliveryFee <= filters.maxDeliveryFee!);
    }

    if (filters.cuisine && filters.cuisine.length > 0) {
      filtered = filtered.filter(restaurant =>
        filters.cuisine!.some(cuisine =>
          restaurant.cuisine.some(restaurantCuisine =>
            restaurantCuisine.toLowerCase().includes(cuisine.toLowerCase())
          )
        )
      );
    }

    if (filters.location) {
      filtered = filtered.filter(restaurant =>
        restaurant.address.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    return filtered;
  };

  const handleApplyFilters = (filters: RestaurantFilters) => {
    setActiveFilters(filters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.minRating) count++;
    if (activeFilters.cuisine && activeFilters.cuisine.length > 0) count++;
    if (activeFilters.maxDeliveryFee !== undefined) count++;
    if (activeFilters.maxDeliveryTime) count++;
    return count;
  };

  const loadRestaurants = async () => {
    try {
      await getRestaurants();
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const renderRestaurant = ({ item: restaurant }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(restaurant)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: restaurant.images[0] }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
          <Text style={styles.rating}>{restaurant.rating}</Text>
          <Text style={styles.cuisineText}> • {restaurant.cuisine.join(', ')}</Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>
          {restaurant.address}
        </Text>
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryItem}>
            <Ionicons name="time" size={12} color={theme.colors.text.tertiary} />
            <Text style={styles.deliveryText}>{restaurant.deliveryTime}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <Ionicons name="car" size={12} color={theme.colors.text.tertiary} />
            <Text style={styles.deliveryText}>${restaurant.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.deliveryItem}>
            <Ionicons name="card" size={12} color={theme.colors.text.tertiary} />
            <Text style={styles.deliveryText}>${restaurant.minimumOrder} min</Text>
          </View>
        </View>
      </View>
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Restaurants Found' : 'No Restaurants Available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No restaurants match "${searchQuery}"`
          : 'Check back later for available restaurants'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisine..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, getActiveFilterCount() > 0 && styles.activeFilterButton]} 
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options" size={20} color={getActiveFilterCount() > 0 ? theme.colors.primary[500] : theme.colors.text.tertiary} />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Restaurants List */}
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Filter Modal */}
      <RestaurantFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  rating: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
  },
  cuisineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  address: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  chevronContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold as '700',
  },
});

export default RestaurantsScreen;