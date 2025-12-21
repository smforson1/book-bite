import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS } from '../../theme';
// @ts-ignore
// import { usePaystack } from 'react-native-paystack-webview';
import PaymentWebView from '../../components/ui/PaymentWebView';
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

    // Payment State
    const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [showWebView, setShowWebView] = useState(false);
    const [currentReference, setCurrentReference] = useState('');

    const { token, user } = useAuthStore((state) => state);

    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
    const total = nights * room.price;

    const handlePaymentSuccess = async (res: any) => {
        const reference = res.reference || currentReference;

        if (!reference) {
            Alert.alert('Error', 'Payment reference missing.');
            return;
        }

        try {
            // 3. Verify Payment & Confirm Booking
            await axios.post(`${API_URL}/payment/verify`, {
                reference,
                email: user?.email,
                amount: total,
                metadata: {
                    purpose: 'BOOKING',
                    bookingId: currentBookingId,
                    userId: user?.id
                }
            });

            Alert.alert('Success', 'Booking confirmed via Payment!', [
                { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) },
            ]);
        } catch (error) {
            console.error('Payment verification failed', error);
            Alert.alert('Payment Error', 'Payment was successful but verification failed. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!checkIn || !checkOut || !guests) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Pending Booking
            const response = await axios.post(
                `${API_URL}/bookings`,
                {
                    roomId: room.id,
                    checkIn: checkIn.toISOString(),
                    checkOut: checkOut.toISOString(),
                    guests: parseInt(guests),
                    status: 'PENDING'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const booking = response.data;
            setCurrentBookingId(booking.id);

            // 2. Trigger Payment
            const payRes = await axios.post(`${API_URL}/payment/initialize`, {
                email: user?.email || 'guest@example.com',
                amount: total,
                metadata: {
                    purpose: 'BOOKING',
                    bookingId: booking.id,
                    userId: user?.id
                }
            });

            setPaymentUrl(payRes.data.authorization_url);
            setCurrentReference(payRes.data.reference);
            setShowWebView(true);

        } catch (error: any) {
            console.error('Initialize error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || error.message;
            Alert.alert('Error', `Payment initiation failed: ${errorMsg}`);
            setLoading(false);
        }
    };

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
                    <Button mode="outlined" onPress={() => setShowCheckIn(true)} style={styles.input} textColor={COLORS.primary}>
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

                    <Button mode="outlined" onPress={() => setShowCheckOut(true)} style={styles.input} textColor={COLORS.primary}>
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
                        <Text>GH₵{room.price}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>Nights</Text>
                        <Text>{nights}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text variant="titleMedium">Total</Text>
                        <Text variant="titleMedium">GH₵{total}</Text>
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleBooking}
                        style={[styles.button, { backgroundColor: COLORS.primary }]}
                        loading={loading}
                        disabled={loading}
                    >
                        Confirm & Pay
                    </Button>

                    <PaymentWebView
                        visible={showWebView}
                        url={paymentUrl}
                        onClose={() => setShowWebView(false)}
                        onSuccess={(ref) => {
                            setShowWebView(false);
                            handlePaymentSuccess({ reference: ref });
                        }}
                        onCancel={() => {
                            setShowWebView(false);
                            setLoading(false);
                            Alert.alert('Cancelled', 'Payment was cancelled');
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

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
