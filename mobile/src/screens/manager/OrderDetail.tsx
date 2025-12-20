import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider, List, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function OrderDetail({ route, navigation }: any) {
    const { order } = route.params;
    const [status, setStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);
    const token = useAuthStore((state) => state.token);
    const theme = useTheme();

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        try {
            await axios.put(`${API_URL}/orders/${order.id}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus(newStatus);
            Alert.alert('Success', `Order marked as ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status', error);
            Alert.alert('Error', 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'PENDING': return theme.colors.primary;
            case 'KITCHEN': return '#f57c00';
            case 'DELIVERY': return '#1976d2';
            case 'COMPLETED': return '#388e3c';
            case 'CANCELLED': return '#d32f2f';
            default: return theme.colors.onSurface;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.title}>Order #{order.id.slice(0, 5)}</Text>
                    <Text style={{ color: getStatusColor(status), fontWeight: 'bold' }}>{status}</Text>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Customer Details</Text>
                        <Text>Name: {order.user?.name || 'Guest'}</Text>
                        <Text>Phone: {order.user?.phone || 'N/A'}</Text>
                        <Text>Address: {order.deliveryAddress || 'N/A'}</Text>
                        {order.notes && (
                            <Text style={styles.notes}>Note: {order.notes}</Text>
                        )}
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Order Items</Text>
                        {order.items.map((item: any, index: number) => (
                            <View key={index}>
                                <View style={styles.itemRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                                    </View>
                                    <Text style={styles.itemPrice}>₦{item.price * item.quantity}</Text>
                                </View>
                                {index < order.items.length - 1 && <Divider style={styles.divider} />}
                            </View>
                        ))}
                        <Divider style={[styles.divider, { backgroundColor: '#000' }]} />
                        <View style={styles.totalRow}>
                            <Text variant="titleMedium">Total</Text>
                            <Text variant="titleMedium">₦{order.totalPrice}</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Status Actions */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Update Status</Text>
                        <View style={styles.actionGrid}>
                            {status === 'PENDING' && (
                                <Button
                                    mode="contained"
                                    onPress={() => updateStatus('KITCHEN')}
                                    style={styles.actionBtn}
                                    buttonColor="#f57c00"
                                    loading={loading}
                                >
                                    Accept & Cook
                                </Button>
                            )}

                            {(status === 'KITCHEN' || status === 'PENDING') && (
                                <Button
                                    mode="contained"
                                    onPress={() => updateStatus('DELIVERY')}
                                    style={styles.actionBtn}
                                    buttonColor="#1976d2"
                                    loading={loading}
                                >
                                    Sent for Delivery
                                </Button>
                            )}

                            {(status === 'DELIVERY' || status === 'KITCHEN') && (
                                <Button
                                    mode="contained"
                                    onPress={() => updateStatus('COMPLETED')}
                                    style={styles.actionBtn}
                                    buttonColor="#388e3c"
                                    loading={loading}
                                >
                                    Mark Completed
                                </Button>
                            )}

                            {status !== 'COMPLETED' && status !== 'CANCELLED' && (
                                <Button
                                    mode="outlined"
                                    onPress={() => updateStatus('CANCELLED')}
                                    style={[styles.actionBtn, { marginTop: 10 }]}
                                    textColor="#d32f2f"
                                    loading={loading}
                                >
                                    Cancel Order
                                </Button>
                            )}
                        </View>
                    </Card.Content>
                </Card>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontWeight: 'bold' },
    card: { marginBottom: 15 },
    sectionTitle: { marginBottom: 10, fontWeight: 'bold' },
    notes: { marginTop: 5, fontStyle: 'italic', color: '#666' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    itemName: { fontWeight: '500' },
    itemQty: { color: '#666', fontSize: 12 },
    itemPrice: { fontWeight: 'bold' },
    divider: { marginVertical: 5 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    actionGrid: { marginTop: 10 },
    actionBtn: { marginBottom: 10 }
});
