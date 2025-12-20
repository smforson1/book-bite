import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, SegmentedButtons, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function OrderList({ navigation }: any) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('active'); // active, completed, cancelled
    const token = useAuthStore((state) => state.token);
    const { colors } = useTheme();

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders/manager`, {
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
            case 'KITCHEN': return '#f57c00'; // Orange
            case 'DELIVERY': return '#1976d2'; // Blue
            case 'COMPLETED': return '#388e3c'; // Green
            case 'CANCELLED': return '#d32f2f'; // Red
            default: return colors.text;
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'active') {
            return ['PENDING', 'KITCHEN', 'DELIVERY'].includes(order.status);
        }
        if (filter === 'completed') return order.status === 'COMPLETED';
        if (filter === 'cancelled') return order.status === 'CANCELLED';
        return true;
    });

    const renderItem = ({ item }: { item: any }) => (
        <Card style={[styles.card, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('OrderDetail', { order: item })}>
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium">Order #{item.id.slice(0, 5)}</Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) + '20' }} textStyle={{ color: getStatusColor(item.status) }}>
                        {item.status}
                    </Chip>
                </View>
                <Text variant="bodyMedium" style={styles.customer}>
                    Customer: {item.user?.name || 'Guest'}
                </Text>
                <Text variant="bodySmall" style={styles.price}>
                    Total: GH₵{item.totalPrice}
                </Text>
                <Text variant="bodySmall" style={styles.date}>
                    {new Date(item.createdAt).toLocaleString()}
                </Text>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>Orders</Text>

                <SegmentedButtons
                    value={filter}
                    onValueChange={setFilter}
                    buttons={[
                        { value: 'active', label: 'Active' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    style={styles.filters}
                    theme={{ colors: { secondaryContainer: colors.primaryLight, onSecondaryContainer: colors.text, outline: colors.primary } }}
                />

                <FlatList
                    data={filteredOrders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text>No orders found</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, flex: 1 },
    title: { marginBottom: 20, fontWeight: 'bold' },
    filters: { marginBottom: 15 },
    card: { marginBottom: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    customer: { marginBottom: 5 },
    price: { fontWeight: 'bold', marginBottom: 5 },
    date: { color: '#666' },
    empty: { alignItems: 'center', marginTop: 50 }
});
