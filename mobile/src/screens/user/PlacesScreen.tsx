import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { View, StyleSheet, FlatList, RefreshControl, ImageBackground, TextInput } from 'react-native';
import { IconButton, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { SPACING, SIZES, SHADOWS, FONTS } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import CustomHeader from '../../components/navigation/CustomHeader';
import SegmentedControl from '../../components/ui/SegmentedControl';
import BusinessCardSkeleton from '../../components/skeletons/BusinessCardSkeleton';

const API_URL = 'http://10.0.2.2:5000/api';

export default function PlacesScreen({ navigation }: any) {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('Restaurants'); // Options: Restaurants, Hotels
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiSearch, setIsAiSearch] = useState(false);
    const [isVisionLoading, setIsVisionLoading] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const token = useAuthStore((state) => state.token);
    const { favorites, fetchFavorites, toggleFavorite, isFavorite } = useFavoriteStore();
    const { colors } = useTheme();

    const { getCurrentLocation, location: userLoc } = useLocation();

    const fetchBusinesses = useCallback(async (lat?: number, lng?: number) => {
        try {
            const params: any = {};
            if (lat) params.userLat = lat;
            if (lng) params.userLng = lng;

            const response = await axios.get(`${API_URL}/business`, { params });
            setBusinesses(response.data);
        } catch (error) {
            console.error('Failed to fetch businesses', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        fetchBusinesses(userLoc?.coords.latitude, userLoc?.coords.longitude);
        if (token) {
            fetchFavorites(token);
        }
    }, [userLoc]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBusinesses();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setIsSearchActive(false);
            fetchBusinesses();
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true);
        try {
            if (isAiSearch) {
                const response = await axios.get(`${API_URL}/ai/search`, {
                    params: { query: searchQuery }
                });
                setBusinesses(response.data);
                setIsSearchActive(true);
            } else {
                fetchBusinesses();
                setIsSearchActive(false);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVisionSearch = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsVisionLoading(true);
            setLoading(true);
            try {
                const response = await axios.post(`${API_URL}/ai/vision-search`, {
                    image: result.assets[0].base64,
                    mimeType: result.assets[0].mimeType
                });

                setSearchQuery(response.data.identified);
                setBusinesses(response.data.results);
                setIsSearchActive(true);
            } catch (error) {
                console.error('Vision search failed', error);
            } finally {
                setIsVisionLoading(false);
                setLoading(false);
            }
        }
    };

    const filteredBusinesses = businesses.filter((b) => {
        const matchesType = (() => {
            if (viewMode === 'Restaurants') return b.type === 'RESTAURANT' || b.type === 'CAFE';
            if (viewMode === 'Hotels') return b.type === 'HOTEL';
            if (viewMode === 'Hostels') return b.type === 'HOSTEL';
            return true;
        })();

        // If semantic search is active, we already have filtered results from backend
        if (isSearchActive && isAiSearch) return matchesType;

        // Otherwise filter client-side by name if there's a search query
        const matchesSearch = searchQuery.trim()
            ? b.name.toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        return matchesType && matchesSearch;
    });

    const renderItem = ({ item }: { item: any }) => (
        <AppCard
            style={styles.card}
            onPress={() => navigation.navigate('BusinessDetails', { id: item.id })}
            noPadding
        >
            <ImageBackground
                source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000' }}
                style={styles.cardImage}
                imageStyle={{ borderTopLeftRadius: SIZES.radius.l, borderTopRightRadius: SIZES.radius.l }}
            >
                <View style={styles.badge}>
                    <AppText variant="caption" color={colors.white} bold>
                        {item.type}
                    </AppText>
                </View>
                <IconButton
                    icon={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                    iconColor={isFavorite(item.id) ? colors.primary : colors.white}
                    size={24}
                    style={styles.favoriteIcon}
                    onPress={() => token && toggleFavorite(item.id, token)}
                />
            </ImageBackground>

            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <AppText variant="h3" style={{ flex: 1 }}>{item.name}</AppText>
                    <View style={[styles.rating, { backgroundColor: colors.background }]}>
                        <IconButton icon="star" size={14} iconColor="#FFD700" style={{ margin: 0 }} />
                        <AppText variant="caption" bold>{item.averageRating?.toFixed(1) || '0.0'}</AppText>
                    </View>
                </View>

                {item.distance !== null && (
                    <View style={[styles.row, { marginTop: -4, marginBottom: 4 }]}>
                        <AppText variant="caption" color={colors.primary} bold>
                            {item.distance < 1 ?
                                `${(item.distance * 1000).toFixed(0)}m away` :
                                `${item.distance.toFixed(1)}km away`}
                        </AppText>
                    </View>
                )}

                <View style={styles.row}>
                    <IconButton icon="map-marker-outline" size={16} iconColor={colors.textLight} style={{ marginLeft: -4, margin: 0 }} />
                    <AppText variant="caption" color={colors.textLight} style={{ flex: 1 }}>
                        {item.address}
                    </AppText>
                </View>
            </View>
        </AppCard>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="Places" />

            <View style={styles.content}>
                <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                    <IconButton
                        icon={isAiSearch ? "auto-fix" : "magnify"}
                        size={20}
                        iconColor={isAiSearch ? colors.primary : colors.textLight}
                        onPress={() => setIsAiSearch(!isAiSearch)}
                    />
                    <TextInput
                        placeholder={isAiSearch ? "Semantic search..." : "Search places..."}
                        placeholderTextColor={colors.textLight}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {isVisionLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                    ) : (
                        <IconButton
                            icon="camera-outline"
                            size={20}
                            iconColor={colors.primary}
                            onPress={handleVisionSearch}
                        />
                    )}
                    {searchQuery.length > 0 && (
                        <IconButton
                            icon="close-circle"
                            size={18}
                            iconColor={colors.textLight}
                            onPress={() => {
                                setSearchQuery('');
                                setIsSearchActive(false);
                                fetchBusinesses();
                            }}
                        />
                    )}
                </View>

                <SegmentedControl
                    options={['Restaurants', 'Hotels', 'Hostels']}
                    selectedOption={viewMode}
                    onOptionPress={setViewMode}
                />

                <FlatList
                    data={loading ? [] : filteredBusinesses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                    contentContainerStyle={{ paddingBottom: 100 }} // Clear CustomTabBar
                    ListEmptyComponent={
                        loading ? (
                            // Show skeleton loaders while loading
                            <>
                                <BusinessCardSkeleton />
                                <BusinessCardSkeleton />
                                <BusinessCardSkeleton />
                            </>
                        ) : (
                            <View style={styles.empty}>
                                <AppText variant="body" color={colors.textLight} center>
                                    No {viewMode.toLowerCase()} found.
                                </AppText>
                            </View>
                        )
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: SPACING.m, paddingTop: SPACING.m },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: SIZES.radius.l,
        paddingHorizontal: SPACING.s,
        marginBottom: SPACING.m,
        height: 50,
        ...SHADOWS.light,
    },
    searchInput: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: 16,
    },
    card: { marginBottom: SPACING.l, ...SHADOWS.medium },
    cardImage: {
        height: 150,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        padding: SPACING.s,
    },
    badge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.xs,
        borderRadius: SIZES.radius.s,
    },
    cardContent: { padding: SPACING.m },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.s,
        borderRadius: SIZES.radius.s,
    },
    favoriteIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    empty: { marginTop: 50, alignItems: 'center' },
});
