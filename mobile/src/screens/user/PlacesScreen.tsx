import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ImageBackground } from 'react-native';
import { IconButton } from 'react-native-paper';
import axios from 'axios';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../theme';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import CustomHeader from '../../components/navigation/CustomHeader';
import SegmentedControl from '../../components/ui/SegmentedControl';

const API_URL = 'http://10.0.2.2:5000/api';

export default function PlacesScreen({ navigation }: any) {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('Restaurants'); // Options: Restaurants, Hotels

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
                    <AppText variant="caption" color={COLORS.white} bold>
                        {item.type}
                    </AppText>
                </View>
            </ImageBackground>

            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <AppText variant="h3" style={{ flex: 1 }}>{item.name}</AppText>
                    <View style={styles.rating}>
                        <IconButton icon="star" size={14} iconColor="#FFD700" style={{ margin: 0 }} />
                        <AppText variant="caption" bold>4.8</AppText>
                    </View>
                </View>

                <View style={styles.row}>
                    <IconButton icon="map-marker-outline" size={16} iconColor={COLORS.textLight} style={{ marginLeft: -4, margin: 0 }} />
                    <AppText variant="caption" color={COLORS.textLight} style={{ flex: 1 }}>
                        {item.address}
                    </AppText>
                </View>
            </View>
        </AppCard>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Places" />

            <View style={styles.content}>
                <SegmentedControl
                    options={['Restaurants', 'Hotels']}
                    selectedOption={viewMode}
                    onOptionPress={setViewMode}
                />

                <FlatList
                    data={filteredBusinesses}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    contentContainerStyle={{ paddingBottom: 100 }} // Clear CustomTabBar
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <AppText variant="body" color={COLORS.textLight} center>
                                No {viewMode.toLowerCase()} found.
                            </AppText>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
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
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.s,
        borderRadius: SIZES.radius.s,
    },
    empty: { marginTop: 50, alignItems: 'center' },
});
