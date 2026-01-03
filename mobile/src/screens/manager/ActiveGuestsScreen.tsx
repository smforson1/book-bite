import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Linking } from 'react-native';
import { Text, Card, Avatar, IconButton, ActivityIndicator, Divider, Chip, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function ActiveGuestsScreen({ navigation }: any) {
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { token } = useAuthStore();
    const { colors, spacing } = useTheme();

    const fetchActiveGuests = async () => {
        try {
            const res = await axios.get(`${API_URL}/bookings/manager/active-guests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuests(res.data);
        } catch (error) {
            console.error('Failed to fetch active guests', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchActiveGuests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchActiveGuests();
    };

    const handleCall = (phone?: string) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 20 }}>Checking guest list...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{ padding: spacing.m }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 5 }}>Active Guests</Text>
                <Text variant="bodyMedium" style={{ color: colors.textLight, marginBottom: 20 }}>
                    {guests.length} {guests.length === 1 ? 'room/bed' : 'rooms/beds'} currently occupied
                </Text>

                {guests.length === 0 ? (
                    <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                        <Card.Content style={{ alignItems: 'center', padding: 40 }}>
                            <Avatar.Icon size={64} icon="account-off-outline" style={{ backgroundColor: colors.primary + '10' }} color={colors.primary} />
                            <Text style={{ marginTop: 20, textAlign: 'center' }}>No active guests at the moment.</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    guests.map((booking) => (
                        <Card
                            key={booking.id}
                            style={[styles.card, { backgroundColor: colors.surface }]}
                            onPress={() => navigation.navigate('BookingDetail', { booking })}
                        >
                            <Card.Content>
                                <View style={styles.guestRow}>
                                    <Avatar.Text
                                        size={44}
                                        label={booking.guestName?.[0] || booking.user?.name?.[0] || 'G'}
                                        style={{ backgroundColor: colors.primary + '15' }}
                                        labelStyle={{ color: colors.primary, fontSize: 18, fontWeight: 'bold' }}
                                    />
                                    <View style={styles.guestInfo}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text variant="titleMedium" numberOfLines={1} style={{ flex: 1, fontWeight: 'bold' }}>
                                                {booking.guestName || booking.user?.name || 'Guest'}
                                            </Text>
                                            <IconButton
                                                icon="phone"
                                                size={20}
                                                iconColor={colors.primary}
                                                onPress={() => handleCall(booking.user?.phone)}
                                                disabled={!booking.user?.phone}
                                            />
                                        </View>
                                        <Text variant="bodySmall" style={{ color: colors.textLight }}>
                                            Room: <Text style={{ fontWeight: 'bold' }}>{booking.room?.name}</Text> • {booking.roomCount} Unit(s)
                                        </Text>
                                    </View>
                                </View>

                                <Divider style={{ marginVertical: 12 }} />

                                <View style={styles.stayRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="labelSmall" style={{ color: colors.textLight }}>Check-in</Text>
                                        <Text variant="bodySmall">{new Date(booking.checkIn).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Chip
                                            compact
                                            style={{ backgroundColor: colors.primary + '10' }}
                                            textStyle={{ color: colors.primary, fontSize: 10 }}
                                        >
                                            {Math.ceil((new Date(booking.checkOut).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Left
                                        </Chip>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                        <Text variant="labelSmall" style={{ color: colors.textLight }}>Check-out</Text>
                                        <Text variant="bodySmall" style={{ color: colors.error }}>{new Date(booking.checkOut).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { marginBottom: 12, borderRadius: 12, elevation: 1 },
    guestRow: { flexDirection: 'row', alignItems: 'center' },
    guestInfo: { flex: 1, marginLeft: 12 },
    stayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    emptyCard: { marginTop: 40, borderRadius: 16 }
});
