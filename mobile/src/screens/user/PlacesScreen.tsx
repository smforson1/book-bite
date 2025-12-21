import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ImageBackground } from 'react-native';
import { IconButton } from 'react-native-paper';
import axios from 'axios';
import { SPACING, SIZES, SHADOWS } from '../../theme';
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
    const token = useAuthStore((state) => state.token);
    const { favorites, fetchFavorites, toggleFavorite, isFavorite } = useFavoriteStore();
    const { colors } = useTheme();

    const fetchBusinesses = async () => {
        try {
            const response = await axios.get(`${API_URL}/business`);
            setBusinesses(response.data);
        } catch (error) {
            console.error('Failed to fetch businesses', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
        if (token) {
            fetchFavorites(token);
        }
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBusinesses();
    };

    const filteredBusinesses = businesses.filter((b) => {
        if (viewMode === 'Restaurants') return b.type === 'RESTAURANT' || b.type === 'CAFE';
        if (viewMode === 'Hotels') return b.type === 'HOTEL';
        return true;
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
                        <AppText variant="caption" bold>4.8</AppText>
                    </View>
                </View>

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
                <SegmentedControl
                    options={['Restaurants', 'Hotels']}
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
    content: { flex: 1, paddingHorizontal: SPACING.m },
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
