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
import { Card, HotelFilterModal, Header, Skeleton, SkeletonList } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useHotel } from '../../contexts/HotelContext';
import { Hotel } from '../../types';
import { googleMapsService } from '../../services/googleMapsService';
import ghanaPromotionService, { GhanaPromotion } from '../../services/ghanaPromotionService';
import { locationService } from '../../services/locationService';
import { useListing } from '../../hooks';

interface HotelsScreenProps {
  navigation: any;
}

interface HotelFilters {
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  rating?: number;
  location?: string;
}

const HotelsScreen: React.FC<HotelsScreenProps> = ({ navigation }) => {
  const applyFiltersToHotels = (hotelList: Hotel[], filters: HotelFilters) => {
    let filtered = [...hotelList];

    if (filters.rating) {
      filtered = filtered.filter(hotel => hotel.rating >= filters.rating!);
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      // Filter hotels based on room prices
      filtered = filtered.filter(hotel => {
        const hotelRooms = getRoomsByHotelId(hotel.id);
        if (hotelRooms.length === 0) return false;
        
        // Check if any room falls within the price range
        return hotelRooms.some((room: any) => {
          if (filters.minPrice !== undefined && room.price < filters.minPrice!) return false;
          if (filters.maxPrice !== undefined && room.price > filters.maxPrice!) return false;
          return true;
        });
      });
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(hotel =>
        filters.amenities!.some(amenity =>
          hotel.amenities.some(hotelAmenity =>
            hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    if (filters.location) {
      filtered = filtered.filter(hotel =>
        hotel.address.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    return filtered;
  };

  const { hotels, getHotels, searchHotels, getRoomsByHotelId } = useHotel();
  const {
    loading,
    searchQuery,
    setSearchQuery,
    filteredItems: filteredHotels,
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
  } = useListing<Hotel>({
    fetcher: getHotels,
    searcher: (query: string) => searchHotels(query),
    filterApplier: applyFiltersToHotels,
  });

  // Apply filters whenever activeFilters change
  useEffect(() => {
    if (Object.keys(activeFilters).length > 0) {
      const filtered = applyFiltersToHotels(hotels, activeFilters);
      setFilteredItems(filtered);
    }
  }, [activeFilters, hotels, setFilteredItems]);

  const [hotelDistances, setHotelDistances] = useState<{ [hotelId: string]: string }>({});

  const hotelPromotions = promotions.filter((promo: GhanaPromotion) => 
    promo.title.toLowerCase().includes('hotel') || 
    promo.description.toLowerCase().includes('booking')
  ).slice(0, 3);

  useEffect(() => {
    if (userLocation && filteredHotels.length > 0) {
      updateHotelDistances();
    }
  }, [userLocation, filteredHotels]);
  
  const updateHotelDistances = async () => {
    if (!userLocation) return;
    
    const distances: { [hotelId: string]: string } = {};
    
    // Calculate distances for visible hotels
    for (const hotel of filteredHotels.slice(0, 10)) {
      try {
        const hotelLocation = await googleMapsService.geocodeAddress(hotel.address);
        const userLocationCoords = await googleMapsService.geocodeAddress(
          `${userLocation.city}, ${userLocation.region}, Ghana`
        );
        
        if (hotelLocation && userLocationCoords) {
          const route = await googleMapsService.getRoute(userLocationCoords, hotelLocation);
          if (route) {
            distances[hotel.id] = route.distance;
          }
        }
      } catch (error) {
        console.error(`Error calculating distance for ${hotel.name}:`, error);
      }
    }
    
    setHotelDistances(distances);
  };

  const handleHotelPress = (hotel: Hotel) => {
    navigation.navigate('HotelDetail', { hotel });
  };

  const renderHotel = ({ item: hotel }: { item: Hotel }) => {
    const hasActivePromo = promotions.some((promo: GhanaPromotion) => 
      userLocation?.city && promo.applicableCities.includes(userLocation.city)
    );
    
    return (
      <TouchableOpacity
        style={styles.hotelCard}
        onPress={() => handleHotelPress(hotel)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: hotel.images[0] }} style={styles.hotelImage} />
        
        {hasActivePromo && (
          <View style={styles.promoTag}>
            <Text style={styles.promoTagText}>OFFER</Text>
          </View>
        )}
        
        <View style={styles.hotelInfo}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
            <Text style={styles.rating}>{hotel.rating}</Text>
            {hotelDistances[hotel.id] && (
              <>
                <Text style={styles.distanceText}> • {hotelDistances[hotel.id]} away</Text>
              </>
            )}
          </View>
          <Text style={styles.address} numberOfLines={2}>
            {hotel.address}
          </Text>
          <View style={styles.amenitiesRow}>
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {hotel.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{hotel.amenities.length - 3}</Text>
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
      <Ionicons name="business-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Hotels Found' : 'No Hotels Available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No hotels match "${searchQuery}"`
          : 'Check back later for available hotels'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header with Search */}
      <Header
        title="Hotels"
        variant="search"
        searchQuery={searchQuery}
        searchPlaceholder="Search hotels..."
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

      {/* Location Header */}
      {userLocation && (
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={16} color={theme.colors.primary[500]} />
          <Text style={styles.locationText}>Hotels in {userLocation.city}</Text>
        </View>
      )}
      
      {/* Hotel Promotions Banner */}
      {hotelPromotions.length > 0 && (
        <View style={styles.promotionsBanner}>
          <FlatList
            horizontal
            data={hotelPromotions}
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
      
      {/* Hotels List */}
      {loading ? (
        <SkeletonList count={6} style={styles.listContainer} />
      ) : (
        <FlatList
          data={filteredHotels}
          renderItem={renderHotel}
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
      <HotelFilterModal
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
  listContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  hotelCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  hotelImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
  },
  hotelInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  hotelName: {
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
  address: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  amenityTag: {
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  amenityText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  moreAmenities: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
  },
  locationText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
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
    backgroundColor: theme.colors.primary[500],
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
  distanceText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  ghanaFlag: {
    marginLeft: theme.spacing.xs,
  },
  ghanaFlagText: {
    fontSize: 12,
  },
});

export default HotelsScreen;