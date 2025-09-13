import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';
import ghanaPromotionService, { GhanaPromotion } from '../services/ghanaPromotionService';

interface UseListingParams<T> {
  fetcher: () => Promise<T[]>;
  searcher: (query: string) => T[];
  filterApplier: (items: T[], filters: any) => T[];
}

interface LocationData {
  city: string;
  region: string;
}

export function useListing<T>({ fetcher, searcher, filterApplier }: UseListingParams<T>) {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [promotions, setPromotions] = useState<GhanaPromotion[]>([]);

  useEffect(() => {
    loadInitialData();
    loadUserLocation();
    loadPromotions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      // Reset to all items when search is cleared
      setFilteredItems(allItems);
    }
  }, [searchQuery, allItems]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const items = await fetcher();
      setAllItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserLocation = async () => {
    try {
      const location = await locationService.getCurrentCity();
      if (location) {
        setUserLocation(location);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const activePromotions = await ghanaPromotionService.getActivePromotions();
      setPromotions(activePromotions);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const searchResults = searcher(searchQuery);
        setFilteredItems(searchResults);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [searchQuery, searcher]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const items = await fetcher();
      setAllItems(items);
      setFilteredItems(items);
      await loadPromotions();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetcher]);

  const handleApplyFilters = useCallback((filters: any) => {
    setActiveFilters(filters);
    setShowFilterModal(false);
    // The actual filtering would be handled by the component using this hook
  }, []);

  const getActiveFilterCount = Object.keys(activeFilters).filter(key => {
    const value = activeFilters[key];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  }).length;

  return {
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    filteredItems,
    setFilteredItems,
    showFilterModal,
    setShowFilterModal,
    activeFilters,
    handleApplyFilters,
    handleRefresh,
    getActiveFilterCount,
    userLocation,
    promotions,
  };
}