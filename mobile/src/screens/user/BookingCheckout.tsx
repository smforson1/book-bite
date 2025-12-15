import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function BookingCheckout({ route, navigation }: any) {
    const { room, business } = route.params;
    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000)); // +1 day
    const [guests, setGuests] = useState('1');
    const [loading, setLoading] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);

    const token = useAuthStore((state) => state.token);

    const handleBooking = async () => {
        if (!checkIn || !checkOut || !guests) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${API_URL}/bookings`,
                {
                    roomId: room.id,
                    checkIn: checkIn.toISOString(),
                    checkOut: checkOut.toISOString(),
                    guests: parseInt(guests),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Success', 'Booking confirmed!', [
                { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
    const total = nights * room.price;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Confirm Booking
                </Text>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleLarge">{business.name}</Text>
                        <Text variant="titleMedium" style={{ marginTop: 10 }}>
                            {room.name}
                        </Text>
                        <Text variant="bodyMedium">{room.description}</Text>
                    </Card.Content>
                </Card>

                <View style={styles.form}>
                    <Button mode="outlined" onPress={() => setShowCheckIn(true)} style={styles.input}>
                        Check-in: {checkIn.toLocaleDateString()}
                    </Button>
                    {showCheckIn && (
                        <DateTimePicker
                            value={checkIn}
                            mode="date"
                            display="default"
                            onChange={(e, d) => {
                                setShowCheckIn(false);
                                if (d) setCheckIn(d);
                            }}
                        />
                    )}

                    <Button mode="outlined" onPress={() => setShowCheckOut(true)} style={styles.input}>
                        Check-out: {checkOut.toLocaleDateString()}
                    </Button>
                    {showCheckOut && (
                        <DateTimePicker
                            value={checkOut}
                            mode="date"
                            display="default"
                            minimumDate={checkIn}
                            onChange={(e, d) => {
                                setShowCheckOut(false);
                                if (d) setCheckOut(d);
                            }}
                        />
                    )}

                    <TextInput
                        label="Guests"
                        value={guests}
                        onChangeText={setGuests}
                        keyboardType="number-pad"
                        mode="outlined"
                        style={styles.input}
                    />

                    <Divider style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text>Price per night</Text>
                        <Text>${room.price}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>Nights</Text>
                        <Text>{nights}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text variant="titleMedium">Total</Text>
                        <Text variant="titleMedium">${total}</Text>
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleBooking}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                    >
                        Confirm & Pay
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

import { Divider } from 'react-native-paper';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    title: { marginBottom: 20, textAlign: 'center' },
    card: { marginBottom: 20 },
    form: { gap: 10 },
    input: { marginBottom: 10 },
    divider: { marginVertical: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    button: { marginTop: 20, paddingVertical: 5 },
});
