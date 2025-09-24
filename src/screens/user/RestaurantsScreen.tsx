import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, RestaurantFilterModal, Header, SkeletonList } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { Restaurant } from '../../types';
import { googleMapsService } from '../../services/googleMapsService';
import { ghanaPromotionService, GhanaPromotion } from '../../services/ghanaPromotionService';
import { locationService, UserLocation } from '../../services/locationService';
import { useListing } from '../../hooks';

interface RestaurantsScreenProps {
  navigation: any;
}

interface RestaurantFilters {
  cuisine?: string[];
  minRating?: number;
  maxDeliveryTime?: number;
  maxDeliveryFee?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

const RestaurantsScreen: React.FC<RestaurantsScreenProps> = ({ navigation }) => {
  const applyFiltersToRestaurants = (restaurantList: Restaurant[], filters: RestaurantFilters) => {
    let filtered = [...restaurantList];

    if (filters.minRating) {
      filtered = filtered.filter(restaurant => restaurant.rating >= filters.minRating!);
    }

    if (filters.maxDeliveryFee !== undefined) {
      filtered = filtered.filter(restaurant => restaurant.deliveryFee <= filters.maxDeliveryFee!);
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      // Filter restaurants based on menu item prices
      filtered = filtered.filter(restaurant => {
        const restaurantMenu = getMenuByRestaurantId(restaurant.id);
        if (restaurantMenu.length === 0) return false;
        
        // Check if any menu item falls within the price range
        return restaurantMenu.some((item: any) => {
          if (filters.minPrice !== undefined && item.price < filters.minPrice!) return false;
          if (filters.maxPrice !== undefined && item.price > filters.maxPrice!) return false;
          return true;
        });
      });
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

  const { restaurants, getRestaurants, searchRestaurants, getMenuByRestaurantId } = useRestaurant();
  const {
    loading,
    searchQuery,
    setSearchQuery,
    filteredItems: filteredRestaurants,
    refreshing,
    handleRefresh,
    showFilterModal,
    setShowFilterModal,
    activeFilters,
    handleApplyFilters,
    getActiveFilterCount,
    userLocation,
    promotions,
    setFilteredItems,
  } = useListing<Restaurant>({
    fetcher: getRestaurants,
    searcher: (query: string) => searchRestaurants(query),
    filterApplier: applyFiltersToRestaurants,
  });

  // Apply filters whenever activeFilters change
  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      const filtered = applyFiltersToRestaurants(restaurants, activeFilters);
      setFilteredItems(filtered);
    }
  }, [activeFilters, restaurants, setFilteredItems]);

  const [deliveryEstimates, setDeliveryEstimates] = useState<{ [restaurantId: string]: string }>({});

  useEffect(() => {
    if (userLocation && filteredRestaurants.length > 0) {
      updateDeliveryEstimates();
    }
  }, [userLocation, filteredRestaurants]);
  
  const updateDeliveryEstimates = async () => {
    if (!userLocation) return;
    
    const estimates: { [restaurantId: string]: string } = {};
    
    for (const restaurant of filteredRestaurants.slice(0, 10)) {
      try {
        const restaurantLocation = await googleMapsService.geocodeAddress(restaurant.address);
        const userLocationCoords = await googleMapsService.geocodeAddress(
          `${userLocation.city}, ${userLocation.region}, Ghana`
        );
        
        if (restaurantLocation && userLocationCoords) {
          const estimate = await googleMapsService.calculateDeliveryEstimate(
            restaurantLocation,
            userLocationCoords
          );
          estimates[restaurant.id] = estimate.estimatedTime;
        }
      } catch (error) {
        console.error(`Error calculating delivery estimate for ${restaurant.name}:`, error);
      }
    }
    
    setDeliveryEstimates(estimates);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleSortByDistance = async () => {
    if (!userLocation) {
      // Get current location if not available
      try {
        const currentLocation = await locationService.getCurrentLocation();
        if (!currentLocation) return;
        
        sortRestaurantsByDistance(currentLocation);
      } catch (error) {
        console.error('Error getting current location:', error);
      }
      return;
    }
    
    sortRestaurantsByDistance(userLocation);
  };

  const sortRestaurantsByDistance = async (currentLocation: any) => {
    try {
      const restaurantsWithDistance = await Promise.all(
        filteredRestaurants.map(async (restaurant) => {
          try {
            // For demo purposes, we'll use mock coordinates
            // In a real app, restaurants would have stored coordinates
            const restaurantCoords = await locationService.geocodeAddress(restaurant.address);
            
            let distance = 0;
            if (restaurantCoords.length > 0) {
              distance = locationService.calculateDistance(
                { latitude: currentLocation.latitude || 5.6037, longitude: currentLocation.longitude || -0.1870 },
                restaurantCoords[0]
              );
            }
            
            return {
              ...restaurant,
              distance: distance
            };
          } catch (error) {
            return {
              ...restaurant,
              distance: 999 // Put restaurants with geocoding errors at the end
            };
          }
        })
      );

      // Sort by distance
      const sortedRestaurants = restaurantsWithDistance.sort((a, b) => a.distance - b.distance);
      setFilteredItems(sortedRestaurants);
    } catch (error) {
      console.error('Error sorting by distance:', error);
    }
  };

  const renderRestaurant = ({ item: restaurant }: { item: Restaurant }) => {
    const hasActivePromo = promotions.some((promo: GhanaPromotion) => 
      userLocation?.city && promo.applicableCities.includes(userLocation.city) &&
      (promo.targetAudience === 'all' || promo.targetAudience === 'returning_users')
    );
    
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => handleRestaurantPress(restaurant)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: restaurant.images[0] }} style={styles.restaurantImage} />
        
        {hasActivePromo && (
          <View style={styles.promoTag}>
            <Text style={styles.promoTagText}>PROMO</Text>
          </View>
        )}
        
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
              <Text style={styles.deliveryText}>
                {deliveryEstimates[restaurant.id] || restaurant.deliveryTime}
              </Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="car" size={12} color={theme.colors.text.tertiary} />
              <Text style={styles.deliveryText}>₵{restaurant.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="card" size={12} color={theme.colors.text.tertiary} />
              <Text style={styles.deliveryText}>₵{restaurant.minimumOrder} min</Text>
            </View>
            {(restaurant as any).distance && (restaurant as any).distance < 999 && (
              <View style={styles.deliveryItem}>
                <Ionicons name="navigate" size={12} color={theme.colors.primary[500]} />
                <Text style={[styles.deliveryText, styles.distanceText]}>
                  {(restaurant as any).distance.toFixed(1)} km
                </Text>
              </View>
            )}
            {userLocation && locationService.isLocationInGhana({ 
              latitude: 5.6037, 
              longitude: -0.1870 
            }) && (
              <View style={styles.ghanaFlag}>
                <Text style={styles.ghanaFlagText}>🇬🇭</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        </View>
      </TouchableOpacity>
    );
  };

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
      {/* Enhanced Header with Search */}
      <Header
        title="Restaurants"
        variant="search"
        searchQuery={searchQuery}
        searchPlaceholder="Search restaurants, cuisine..."
        onSearchChange={setSearchQuery}
        rightActions={
          <TouchableOpacity 
            style={[styles.filterButton, getActiveFilterCount > 0 && styles.activeFilterButton]} 
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options" size={20} color={getActiveFilterCount > 0 ? theme.colors.primary[500] : theme.colors.text.tertiary} />
            {getActiveFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {/* Location Header with Sort Options */}
      {userLocation && (
        <View style={styles.locationHeader}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.locationText}>Delivering to {userLocation.city}</Text>
          </View>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => handleSortByDistance()}
          >
            <Ionicons name="navigate" size={14} color={theme.colors.primary[500]} />
            <Text style={styles.sortButtonText}>Sort by Distance</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Promotions Banner */}
      {promotions.length > 0 && (
        <View style={styles.promotionsBanner}>
          <FlatList
            horizontal
            data={promotions.slice(0, 3)}
            renderItem={({ item: promo }) => (
              <View style={[styles.promoCard, { backgroundColor: promo.backgroundColor }]}>
                <Text style={[styles.promoTitle, { color: promo.textColor }]}>
                  {promo.title}
                </Text>
                <Text style={[styles.promoDescription, { color: promo.textColor }]}>
                  {promo.description}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            style={styles.promoBanner}
          />
        </View>
      )}
      
      {/* Restaurants List */}
      {loading ? (
        <SkeletonList count={6} style={styles.listContainer} />
      ) : (
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
      )}

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
  distanceText: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium as '500',
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  sortButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  promotionsBanner: {
    paddingVertical: theme.spacing.md,
  },
  promoBanner: {
    paddingLeft: theme.spacing.lg,
  },
  promoCard: {
    width: 280,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
  },
  promoTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    marginBottom: theme.spacing.xs,
  },
  promoDescription: {
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.9,
  },
  promoTag: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.success[500],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  promoTagText: {
    color: theme.colors.neutral[0],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold as '700',
  },
  ghanaFlag: {
    marginLeft: theme.spacing.xs,
  },
  ghanaFlagText: {
    fontSize: 12,
  },
});

export default RestaurantsScreen;