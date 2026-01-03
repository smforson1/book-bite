import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, SegmentedButtons, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function OrderList({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('active'); // active, completed, cancelled

    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors } = useTheme();

    const isRestaurant = business?.type === 'RESTAURANT';

    const fetchData = async () => {
        try {
            const endpoint = isRestaurant ? `${API_URL}/orders/manager` : `${API_URL}/bookings/manager`;
            const response = await axios.get(endpoint, {
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

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
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

    const filteredItems = items.filter(item => {
        if (filter === 'active') {
            return isRestaurant
                ? ['PENDING', 'KITCHEN', 'DELIVERY'].includes(item.status)
                : ['PENDING', 'CONFIRMED'].includes(item.status);
        }
        if (filter === 'completed') return item.status === 'COMPLETED';
        if (filter === 'cancelled') return item.status === 'CANCELLED';
        return true;
    });

    const renderItem = ({ item }: { item: any }) => (
        <Card
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate(isRestaurant ? 'OrderDetail' : 'BookingDetail', isRestaurant ? { order: item } : { booking: item })}
        >
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium">
                        {isRestaurant ? `Order #${item.id.slice(0, 5)}` : `Booking for ${item.room?.name || 'Room'}`}
                    </Text>
                    <Chip style={{ backgroundColor: getStatusColor(item.status) + '20' }} textStyle={{ color: getStatusColor(item.status) }}>
                        {item.status}
                    </Chip>
                </View>
                <Text variant="bodyMedium" style={styles.customer}>
                    {isRestaurant ? 'Customer: ' : 'Guest: '}{item.guestName || item.user?.name || 'Guest'}
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
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
                    {isRestaurant ? 'Orders' : 'Bookings'}
                </Text>

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
                    data={filteredItems}
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
