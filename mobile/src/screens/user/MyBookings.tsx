import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function MyBookings() {
    const [activeTab, setActiveTab] = useState('bookings');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const token = useAuthStore((state) => state.token);
    const { colors } = useTheme();

    const fetchData = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'bookings' ? '/bookings/user' : '/orders/user';
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <AppText variant="h1" style={[styles.title, { color: colors.primary }]}>
                    My Activity
                </AppText>
                <SegmentedButtons
                    value={activeTab}
                    onValueChange={setActiveTab}
                    buttons={[
                        { value: 'bookings', label: 'Bookings' },
                        { value: 'orders', label: 'Orders' },
                    ]}
                    theme={{ colors: { secondaryContainer: colors.primaryLight, outline: colors.primary } }}
                    style={styles.segmentedButtons}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                {items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <AppText color={colors.textLight}>No {activeTab} found.</AppText>
                    </View>
                ) : (
                    items.map((item) => (
                        <Card key={item.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                            <Card.Content>
                                <View style={styles.row}>
                                    <AppText variant="h3">{item.business?.name || 'Unknown Business'}</AppText>
                                    <AppText
                                        bold
                                        color={
                                            item.status === 'PENDING'
                                                ? colors.warning
                                                : item.status === 'CONFIRMED'
                                                    ? colors.success
                                                    : colors.error
                                        }
                                    >
                                        {item.status}
                                    </AppText>
                                </View>

                                {activeTab === 'bookings' ? (
                                    <>
                                        <AppText variant="body" color={colors.textLight}>
                                            {new Date(item.checkIn).toLocaleDateString()} -{' '}
                                            {new Date(item.checkOut).toLocaleDateString()}
                                        </AppText>
                                        <AppText variant="caption" color={colors.textLight}>Room: {item.room?.name}</AppText>
                                    </>
                                ) : (
                                    <>
                                        <AppText variant="body" color={colors.textLight}>Items: {item.items?.length || 0}</AppText>
                                        <AppText variant="caption" color={colors.textLight} numberOfLines={1}>
                                            {item.items?.map((i: any) => i.name).join(', ')}
                                        </AppText>
                                    </>
                                )}

                                <AppText variant="h3" style={[styles.price, { color: colors.primary }]}>
                                    Total: GH₵{item.totalPrice}
                                </AppText>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20 },
    title: { marginBottom: 15, fontWeight: 'bold' },
    segmentedButtons: { marginTop: 5 },
    content: { padding: 20 },
    card: { marginBottom: 15 },
    emptyState: { alignItems: 'center', marginTop: 50 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    price: { marginTop: 10, alignSelf: 'flex-end', fontWeight: 'bold' },
});
