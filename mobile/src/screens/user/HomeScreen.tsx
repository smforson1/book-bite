import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, ImageBackground, TextInput } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import { COLORS, SPACING, SIZES, FONTS, SHADOWS } from '../../theme';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import CustomHeader from '../../components/navigation/CustomHeader';

const API_URL = 'http://10.0.2.2:5000/api';

export default function HomeScreen({ navigation }: any) {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const { user } = useAuthStore((state: any) => state);

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
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBusinesses();
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
                    backgroundColor: isSelected ? COLORS.primary : COLORS.white,
                    marginRight: SPACING.s,
                    paddingVertical: SPACING.s,
                    paddingHorizontal: SPACING.m,
                    borderRadius: SIZES.radius.xl,
                }}
            >
                <AppText
                    variant="label"
                    color={isSelected ? COLORS.white : COLORS.text}
                >
                    {label}
                </AppText>
            </AppCard>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader
                title={`Hello, ${user?.name?.split(' ')[0] || 'Guest'} 👋`}
                rightAction={
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton icon="bell-outline" size={24} iconColor={COLORS.text} onPress={() => { }} />
                        <IconButton
                            icon="account-circle-outline"
                            size={24}
                            iconColor={COLORS.text}
                            onPress={() => navigation.navigate('Profile')}
                        />
                    </View>
                }
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            >
                <View style={styles.searchContainer}>
                    <IconButton icon="magnify" size={20} iconColor={COLORS.textLight} />
                    <TextInput
                        placeholder="Find your next bite..."
                        placeholderTextColor={COLORS.textLight}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filters}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip label="All" type={null} />
                        <FilterChip label="Hotels" type="HOTEL" />
                        <FilterChip label="Restaurants" type="RESTAURANT" />
                        <FilterChip label="Cafes" type="CAFE" />
                    </ScrollView>
                </View>

                <AppText variant="h3" style={styles.sectionTitle}>Featured Places</AppText>

                {filteredBusinesses.map((business) => (
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
                                <AppText variant="caption" color={COLORS.white} bold>
                                    {business.type}
                                </AppText>
                            </View>
                        </ImageBackground>

                        <View style={styles.cardContent}>
                            <View style={styles.row}>
                                <AppText variant="h3" style={{ flex: 1 }}>{business.name}</AppText>
                                <View style={styles.rating}>
                                    <IconButton icon="star" size={14} iconColor="#FFD700" style={{ margin: 0 }} />
                                    <AppText variant="caption" bold>4.8</AppText>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <IconButton icon="map-marker-outline" size={16} iconColor={COLORS.textLight} style={{ marginLeft: -4, margin: 0 }} />
                                <AppText variant="caption" color={COLORS.textLight} style={{ flex: 1 }}>
                                    {business.address}
                                </AppText>
                            </View>

                            <AppText variant="body" numberOfLines={2} color={COLORS.textLight} style={styles.description}>
                                {business.description || 'Experience the best quality food and service in town.'}
                            </AppText>
                        </View>
                    </AppCard>
                ))}

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    content: {
        padding: SPACING.m
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
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
        color: COLORS.text,
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
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.s,
        borderRadius: SIZES.radius.s,
    },
    description: {
        marginTop: SPACING.s,
    }
});
