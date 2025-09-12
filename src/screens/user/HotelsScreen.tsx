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
import { Card, HotelFilterModal } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useHotel } from '../../contexts/HotelContext';
import { Hotel } from '../../types';

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
  const { hotels, loading, getHotels, searchHotels } = useHotel();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<HotelFilters>({});

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = searchHotels(searchQuery, activeFilters);
      setFilteredHotels(searchResults);
    } else {
      // Apply filters without search
      const filtered = applyFiltersToHotels(hotels, activeFilters);
      setFilteredHotels(filtered);
    }
  }, [searchQuery, hotels, activeFilters]);

  const applyFiltersToHotels = (hotelList: Hotel[], filters: HotelFilters) => {
    let filtered = [...hotelList];

    if (filters.rating) {
      filtered = filtered.filter(hotel => hotel.rating >= filters.rating!);
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

  const handleApplyFilters = (filters: HotelFilters) => {
    setActiveFilters(filters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.rating) count++;
    if (activeFilters.amenities && activeFilters.amenities.length > 0) count++;
    if (activeFilters.minPrice || activeFilters.maxPrice) count++;
    return count;
  };

  const loadHotels = async () => {
    try {
      await getHotels();
    } catch (error) {
      console.error('Error loading hotels:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHotels();
    setRefreshing(false);
  };

  const handleHotelPress = (hotel: Hotel) => {
    navigation.navigate('HotelDetail', { hotel });
  };

  const renderHotel = ({ item: hotel }: { item: Hotel }) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => handleHotelPress(hotel)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: hotel.images[0] }} style={styles.hotelImage} />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{hotel.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
          <Text style={styles.rating}>{hotel.rating}</Text>
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
        </View>
      </View>
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );

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
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hotels..."
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

      {/* Hotels List */}
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
});

export default HotelsScreen;