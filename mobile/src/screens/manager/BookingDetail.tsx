import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider, List, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function BookingDetail({ route, navigation }: any) {
    const { booking } = route.params;
    const [status, setStatus] = useState(booking.status);
    const [loading, setLoading] = useState(false);
    const token = useAuthStore((state) => state.token);
    const { colors, spacing } = useTheme();

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        try {
            await axios.put(`${API_URL}/bookings/${booking.id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus(newStatus);
            Alert.alert('Success', `Booking marked as ${newStatus}`);
        } catch (error: any) {
            console.error('Failed to update status', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'PENDING': return '#FFA000';
            case 'CONFIRMED': return '#388E3C';
            case 'CANCELLED': return '#D32F2F';
            default: return colors.text;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ padding: spacing.m }}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Booking Details</Text>
                    <Chip style={{ backgroundColor: getStatusColor(status) + '20' }} textStyle={{ color: getStatusColor(status), fontWeight: 'bold' }}>
                        {status}
                    </Chip>
                </View>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Guest Information</Text>
                        <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{booking.guestName || booking.user?.name || 'Guest'}</Text>
                        {booking.user?.email && <Text>Email: {booking.user.email}</Text>}
                        {booking.user?.phone && <Text>Phone: {booking.user.phone}</Text>}
                        {booking.bookingGender && (
                            <Text style={{ marginTop: 5, color: booking.bookingGender === 'MALE' ? '#1976D2' : '#E91E63', fontWeight: 'bold' }}>
                                Gender: {booking.bookingGender}
                            </Text>
                        )}
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Stay Details</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelSmall">Room Type</Text>
                                <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{booking.room?.name}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelSmall">Quantity</Text>
                                <Text variant="bodyLarge">{booking.roomCount} {booking.roomCount > 1 ? 'Spaces' : 'Space'}</Text>
                            </View>
                        </View>

                        <Divider style={{ marginVertical: 10 }} />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelSmall">Check In</Text>
                                <Text variant="bodyMedium">{new Date(booking.checkIn).toDateString()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelSmall">Check Out</Text>
                                <Text variant="bodyMedium">{new Date(booking.checkOut).toDateString()}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Payment Info</Text>
                        <View style={styles.summaryRow}>
                            <Text>Total Price</Text>
                            <Text style={{ fontWeight: 'bold' }}>GH₵{Number(booking.totalPrice).toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text>Paid Amount</Text>
                            <Text style={{ fontWeight: 'bold', color: colors.success }}>GH₵{Number(booking.paidAmount).toFixed(2)}</Text>
                        </View>
                        <Divider style={{ marginVertical: 5 }} />
                        <View style={styles.summaryRow}>
                            <Text variant="titleMedium">Balance Due</Text>
                            <Text variant="titleMedium" style={{ color: colors.error }}>
                                GH₵{(Number(booking.totalPrice) - Number(booking.paidAmount)).toFixed(2)}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <View style={styles.actions}>
                    {status === 'PENDING' && (
                        <Button
                            mode="contained"
                            onPress={() => updateStatus('CONFIRMED')}
                            loading={loading}
                            style={[styles.btn, { backgroundColor: colors.success }]}
                        >
                            Confirm Booking
                        </Button>
                    )}

                    {status !== 'CANCELLED' && (
                        <Button
                            mode="outlined"
                            onPress={() => updateStatus('CANCELLED')}
                            loading={loading}
                            style={styles.btn}
                            textColor={colors.error}
                        >
                            Cancel Booking
                        </Button>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    card: { marginBottom: 15 },
    sectionTitle: { marginBottom: 10, color: '#666' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    actions: { marginTop: 10 },
    btn: { marginBottom: 12, paddingVertical: 4 }
});
