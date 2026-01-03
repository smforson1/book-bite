import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MotiView } from 'moti';
import axios from 'axios';

import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import CustomHeader from '../../components/navigation/CustomHeader';

const API_URL = 'http://10.0.2.2:5000/api';

export default function MyOrders({ navigation }: any) {
    const { colors, spacing, sizes } = useTheme();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const token = useAuthStore((state) => state.token);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return colors.primary;
            case 'KITCHEN': return colors.warning || '#f57c00'; // Orange
            case 'DELIVERY': return '#1976d2'; // Blue
            case 'COMPLETED': return colors.success;
            case 'CANCELLED': return colors.error;
            default: return colors.textLight;
        }
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100 }}
        >
            <AppCard style={styles.card}>
                <View style={styles.header}>
                    <AppText variant="h3">{item.business?.name || 'Restaurant'}</AppText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <AppText variant="caption" color={getStatusColor(item.status)} bold>
                            {item.status}
                        </AppText>
                    </View>
                </View>

                <AppText variant="caption" style={styles.date} color={colors.textLight}>
                    {new Date(item.createdAt).toLocaleString()}
                </AppText>

                <View style={styles.items}>
                    {item.items.map((i: any, idx: number) => (
                        <AppText key={idx} variant="body" numberOfLines={1}>
                            {i.quantity}x {i.name}
                        </AppText>
                    ))}
                </View>

                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    <AppText variant="h3" style={[styles.total, { color: colors.primary }]}>
                        Total: GH₵{item.totalPrice}
                    </AppText>
                </View>
            </AppCard>
        </MotiView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="My Orders" />

            <View style={[styles.content, { paddingHorizontal: spacing.m }]}>
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <AppText variant="body" color={colors.textLight} center style={{ marginBottom: spacing.l }}>
                                No orders yet. Time for a bite?
                            </AppText>
                            <AppButton
                                title="Browse Food"
                                onPress={() => navigation.navigate('Home')}
                            />
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    card: { marginBottom: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    date: { marginBottom: 16 },
    items: { marginBottom: 16 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
    total: {},
    empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 32 },
});
