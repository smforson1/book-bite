import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import PaymentWebView from '../../components/ui/PaymentWebView';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function BookingCheckout({ route, navigation }: any) {
    const { room, business } = route.params;
    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000)); // +1 day
    const [guests, setGuests] = useState('1');
    const [roomCount, setRoomCount] = useState(1);
    const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);
    const [paymentOption, setPaymentOption] = useState<'FULL' | 'DEPOSIT'>('FULL');

    // Payment State
    const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [showWebView, setShowWebView] = useState(false);
    const [currentReference, setCurrentReference] = useState('');

    const { token, user } = useAuthStore((state) => state);
    const { colors } = useTheme();

    const isHostel = business?.type === 'HOSTEL';

    const nights = isHostel ? 1 : Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
    const effectiveTotal = isHostel
        ? room.price * roomCount
        : nights * room.price * roomCount;

    const depositAmount = effectiveTotal * 0.20;
    const amountToPay = paymentOption === 'FULL' ? effectiveTotal : depositAmount;

    // Reset payment option if room count drops <= 3
    if (roomCount <= 3 && paymentOption === 'DEPOSIT') {
        setPaymentOption('FULL');
    }

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
                amount: amountToPay, // Use actual paid amount
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

        if (isHostel && !gender) {
            Alert.alert('Error', 'Please select a gender (Male/Female) for your bed space.');
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
                    roomCount: roomCount,
                    bookingGender: isHostel ? gender : undefined,
                    status: 'PENDING'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const booking = response.data;
            setCurrentBookingId(booking.id);

            // 2. Trigger Payment
            const payRes = await axios.post(`${API_URL}/payment/initialize`, {
                email: user?.email || 'guest@example.com',
                amount: amountToPay,
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
            Alert.alert('Error', `Booking failed: ${errorMsg}`);
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <AppText variant="h1" style={styles.title} center>
                    Confirm Booking
                </AppText>

                <AppCard style={styles.card}>
                    <AppText variant="h2">{business.name}</AppText>
                    <AppText variant="h3" style={{ marginTop: 10 }}>
                        {room.name}
                    </AppText>
                    <AppText variant="body" color={colors.textLight}>{room.description}</AppText>
                </AppCard>

                <View style={styles.form}>
                    <Button mode="outlined" onPress={() => setShowCheckIn(true)} style={[styles.input, { borderColor: colors.border }]} textColor={colors.primary}>
                        {isHostel ? "Move-in Date: " : "Check-in: "}{checkIn.toLocaleDateString()}
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

                    <Button mode="outlined" onPress={() => setShowCheckOut(true)} style={[styles.input, { borderColor: colors.border }]} textColor={colors.primary}>
                        {isHostel ? "Move-out Date: " : "Check-out: "}{checkOut.toLocaleDateString()}
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

                    {isHostel && (
                        <View style={{ marginBottom: 15 }}>
                            <AppText variant="h3" style={{ marginBottom: 5 }}>Bed Space Gender *</AppText>
                            <RadioButton.Group onValueChange={val => setGender(val as 'MALE' | 'FEMALE')} value={gender || ''}>
                                <View style={{ flexDirection: 'row', gap: 20 }}>
                                    <View style={styles.radioRow}>
                                        <RadioButton value="MALE" color={colors.primary} />
                                        <AppText>Male</AppText>
                                    </View>
                                    <View style={styles.radioRow}>
                                        <RadioButton value="FEMALE" color={colors.primary} />
                                        <AppText>Female</AppText>
                                    </View>
                                </View>
                            </RadioButton.Group>
                        </View>
                    )}

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <TextInput
                                label="Guests"
                                value={guests}
                                onChangeText={setGuests}
                                keyboardType="number-pad"
                                mode="outlined"
                                theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.textLight } }}
                                style={{ backgroundColor: colors.surface }}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <AppText variant="body" style={{ marginBottom: 5 }}>
                                {isHostel ? `Bed Spaces (${roomCount})` : `Rooms (${roomCount})`}
                            </AppText>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Button mode="outlined" compact onPress={() => setRoomCount(Math.max(1, roomCount - 1))} textColor={colors.primary} style={{ borderColor: colors.border }}>-</Button>
                                <AppText style={{ marginHorizontal: 10 }}>{roomCount}</AppText>
                                <Button
                                    mode="outlined"
                                    compact
                                    onPress={() => setRoomCount(Math.min(room.totalStock || 10, roomCount + 1))}
                                    textColor={colors.primary}
                                    style={{ borderColor: colors.border }}
                                >+</Button>
                            </View>
                        </View>
                    </View>

                    <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                        <AppText>{isHostel ? "Price per Year/Bed" : "Price per night"}</AppText>
                        <AppText>GH₵{room.price}</AppText>
                    </View>

                    {!isHostel && (
                        <View style={styles.summaryRow}>
                            <AppText>Nights</AppText>
                            <AppText>{nights}</AppText>
                        </View>
                    )}

                    <View style={styles.summaryRow}>
                        <AppText>{isHostel ? "Bed Spaces" : "Rooms"}</AppText>
                        <AppText>{roomCount}</AppText>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
                        <AppText variant="h3">Total</AppText>
                        <AppText variant="h3">GH₵{effectiveTotal.toFixed(2)}</AppText>
                    </View>

                    <Divider style={{ marginVertical: 10, backgroundColor: colors.border }} />

                    <AppText variant="h3" style={{ marginBottom: 10 }}>Payment Option</AppText>
                    <RadioButton.Group onValueChange={value => setPaymentOption(value as 'FULL' | 'DEPOSIT')} value={paymentOption}>
                        <View style={styles.radioRow}>
                            <RadioButton value="FULL" color={colors.primary} />
                            <AppText onPress={() => setPaymentOption('FULL')}>Pay Full Amount (GH₵{effectiveTotal.toFixed(2)})</AppText>
                        </View>

                        {roomCount > 3 && (
                            <View style={styles.radioRow}>
                                <RadioButton value="DEPOSIT" color={colors.primary} />
                                <View>
                                    <AppText onPress={() => setPaymentOption('DEPOSIT')}>
                                        Pay 20% Deposit (GH₵{depositAmount.toFixed(2)})
                                    </AppText>
                                    <AppText variant="caption" color={colors.textLight}>Mass Booking Benefit</AppText>
                                </View>
                            </View>
                        )}
                    </RadioButton.Group>

                    {roomCount <= 3 && (
                        <AppText variant="caption" color={colors.textLight} style={{ fontStyle: 'italic', marginTop: 5 }}>
                            Deposit option available for bookings of 4+ rooms.
                        </AppText>
                    )}

                    <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border, marginTop: 15 }]}>
                        <AppText variant="h2" bold color={colors.primary}>
                            Pay Now:
                        </AppText>
                        <AppText variant="h2" bold color={colors.primary}>
                            GH₵{amountToPay.toFixed(2)}
                        </AppText>
                    </View>

                    <AppButton
                        title="Confirm & Pay"
                        onPress={handleBooking}
                        isLoading={loading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    title: { marginBottom: 20 },
    card: { marginBottom: 20 },
    form: { gap: 10 },
    input: { marginBottom: 10 },
    divider: { marginVertical: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
    radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    row: { flexDirection: 'row', alignItems: 'center' }
});
