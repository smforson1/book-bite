import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, ImageBackground, TextInput } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, SIZES, FONTS, SHADOWS } from '../../theme';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import CustomHeader from '../../components/navigation/CustomHeader';
import BusinessCardSkeleton from '../../components/skeletons/BusinessCardSkeleton';

const API_URL = 'http://10.0.2.2:5000/api';

export default function HomeScreen({ navigation }: any) {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [isAiSearch, setIsAiSearch] = useState(false);

    const { user, token } = useAuthStore((state: any) => state);
    const { favorites, fetchFavorites, toggleFavorite, isFavorite } = useFavoriteStore();
    const { colors } = useTheme();

    const fetchBusinesses = async () => {
        try {
            let url = `${API_URL}/business`;
            const response = await axios.get(url);
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchBusinesses();
            return;
        }

        setLoading(true);
        try {
            if (isAiSearch) {
                const response = await axios.get(`${API_URL}/ai/search`, {
                    params: { query: searchQuery }
                });
                setBusinesses(response.data);
            } else {
                fetchBusinesses();
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBusinesses = businesses.filter((b) => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType ? b.type === selectedType : true;
        return matchesSearch && matchesType;
    });

    const FilterChip = ({ label, type }: { label: string, type: string | null }) => {
        const isSelected = selectedType === type;
        return (
            <AppCard
                onPress={() => setSelectedType(type)}
                style={{
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    marginRight: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 30,
                }}
            >
                <AppText
                    variant="label"
                    color={isSelected ? colors.white : colors.text}
                >
                    {label}
                </AppText>
            </AppCard>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader
                title={`Hello, ${user?.name?.split(' ')[0] || 'Guest'} 👋`}
                rightAction={
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton icon="bell-outline" size={24} iconColor={colors.text} onPress={() => { }} />
                        <IconButton
                            icon="account-circle-outline"
                            size={24}
                            iconColor={colors.text}
                            onPress={() => navigation.navigate('Profile')}
                        />
                    </View>
                }
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                    <IconButton
                        icon={isAiSearch ? "auto-fix" : "magnify"}
                        size={20}
                        iconColor={isAiSearch ? colors.primary : colors.textLight}
                        onPress={() => setIsAiSearch(!isAiSearch)}
                    />
                    <TextInput
                        placeholder={isAiSearch ? "Ask AI (e.g. quiet student spots)..." : "Find your next bite..."}
                        placeholderTextColor={colors.textLight}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <IconButton
                            icon="close-circle"
                            size={18}
                            iconColor={colors.textLight}
                            onPress={() => {
                                setSearchQuery('');
                                fetchBusinesses();
                            }}
                        />
                    )}
                </View>

                <View style={styles.filters}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip label="All" type={null} />
                        <FilterChip label="Hostels" type="HOSTEL" />
                        <FilterChip label="Hotels" type="HOTEL" />
                        <FilterChip label="Restaurants" type="RESTAURANT" />
                    </ScrollView>
                </View>

                {/* Featured Businesses */}
                <View style={styles.section}>
                    <AppText variant="h2" style={styles.sectionTitle}>Featured Businesses</AppText>

                    {loading ? (
                        // Show skeleton loaders while loading
                        <>
                            <BusinessCardSkeleton />
                            <BusinessCardSkeleton />
                            <BusinessCardSkeleton />
                        </>
                    ) : filteredBusinesses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <AppText variant="body" color={colors.textLight} center>
                                No businesses found
                            </AppText>
                        </View>
                    ) : (
                        filteredBusinesses.map((business) => (
                            <AppCard
                                key={business.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('BusinessDetails', { id: business.id })}
                                noPadding
                            >
                                <ImageBackground
                                    source={{ uri: business.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop' }}
                                    style={styles.cardImage}
                                    imageStyle={{ borderTopLeftRadius: SIZES.radius.l, borderTopRightRadius: SIZES.radius.l }}
                                >
                                    <View style={styles.badge}>
                                        <AppText variant="caption" color={colors.white} bold>
                                            {business.type}
                                        </AppText>
                                    </View>
                                    <IconButton
                                        icon={isFavorite(business.id) ? 'heart' : 'heart-outline'}
                                        iconColor={isFavorite(business.id) ? colors.primary : colors.white}
                                        size={24}
                                        style={styles.favoriteIcon}
                                        onPress={() => token && toggleFavorite(business.id, token)}
                                    />
                                </ImageBackground>

                                <View style={styles.cardContent}>
                                    <View style={styles.row}>
                                        <AppText variant="h3" style={{ flex: 1 }}>{business.name}</AppText>
                                        <View style={[styles.rating, { backgroundColor: colors.background }]}>
                                            <IconButton icon="star" size={14} iconColor="#FFD700" style={{ margin: 0 }} />
                                            <AppText variant="caption" bold>4.8</AppText>
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <IconButton icon="map-marker-outline" size={16} iconColor={colors.textLight} style={{ marginLeft: -4, margin: 0 }} />
                                        <AppText variant="caption" color={colors.textLight} style={{ flex: 1 }}>
                                            {business.address}
                                        </AppText>
                                    </View>

                                    <AppText variant="body" numberOfLines={2} color={colors.textLight} style={styles.description}>
                                        {business.description || 'Experience the best quality food and service in town.'}
                                    </AppText>
                                </View>
                            </AppCard>
                        ))
                    )}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.m
    },
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
    filters: {
        marginBottom: SPACING.l,
        flexDirection: 'row',
    },
    sectionTitle: {
        marginBottom: SPACING.m,
    },
    card: {
        marginBottom: SPACING.l,
        ...SHADOWS.medium,
    },
    cardImage: {
        height: 180,
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
    favoriteIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    section: {
        marginBottom: SPACING.l,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl,
    },
    cardContent: {
        padding: SPACING.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.s,
        borderRadius: SIZES.radius.s,
    },
    description: {
        marginTop: SPACING.s,
    }
});
