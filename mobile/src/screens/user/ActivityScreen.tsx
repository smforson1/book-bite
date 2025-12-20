import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../theme';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import CustomHeader from '../../components/navigation/CustomHeader';
import SegmentedControl from '../../components/ui/SegmentedControl';

const API_URL = 'http://10.0.2.2:5000/api';

export default function ActivityScreen({ navigation, route }: any) {
    const [activeTab, setActiveTab] = useState('Bookings'); // Bookings | Orders

    useEffect(() => {
        if (route.params?.tab) {
            setActiveTab(route.params.tab);
        }
    }, [route.params?.tab]);

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const token = useAuthStore((state) => state.token);

    const fetchData = async () => {
        try {
            // setLoading(true); // Don't block UI on tab switch, maybe show skeleton
            const endpoint = activeTab === 'Bookings' ? '/bookings/user' : '/orders/user';
            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#F57C00'; // Orange
            case 'CONFIRMED': return COLORS.success;
            case 'COMPLETED': return COLORS.success;
            case 'CANCELLED': return COLORS.error;
            case 'KITCHEN': return '#F57C00';
            case 'DELIVERY': return '#1976D2';
            default: return COLORS.textLight;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
                <AppText variant="h3">{item.business?.name || 'Unknown Business'}</AppText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <AppText variant="caption" color={getStatusColor(item.status)} bold>
                        {item.status}
                    </AppText>
                </View>
            </View>

            {activeTab === 'Bookings' ? (
                <>
                    <AppText variant="body" color={COLORS.textLight}>
                        {new Date(item.checkIn).toLocaleDateString()} - {new Date(item.checkOut).toLocaleDateString()}
                    </AppText>
                    <AppText variant="caption" color={COLORS.textLight}>
                        Room: {item.room?.name}
                    </AppText>
                </>
            ) : (
                <>
                    <AppText variant="body" color={COLORS.textLight}>
                        {item.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </AppText>
                    <AppText variant="caption" color={COLORS.textLight}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </AppText>
                </>
            )}

            <View style={styles.cardFooter}>
                <AppText variant="h3" color={COLORS.primary}>
                    ₦{item.totalPrice}
                </AppText>
                {/* <AppButton title="View" variant="ghost" onPress={() => {}} style={{ height: 32 }} /> */}
            </View>
        </AppCard>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Activity" />

            <View style={styles.content}>
                <SegmentedControl
                    options={['Bookings', 'Orders']}
                    selectedOption={activeTab}
                    onOptionPress={setActiveTab}
                />

                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <AppText variant="body" color={COLORS.textLight} center>
                                No {activeTab.toLowerCase()} found.
                            </AppText>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, paddingHorizontal: SPACING.m },
    card: { marginBottom: SPACING.m },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.s },
    statusBadge: { paddingHorizontal: SPACING.s, paddingVertical: 4, borderRadius: SIZES.radius.s },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.m, paddingTop: SPACING.s, borderTopWidth: 1, borderTopColor: COLORS.border },
    empty: { marginTop: 50, alignItems: 'center' },
});
