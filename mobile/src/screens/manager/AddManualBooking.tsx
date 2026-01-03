import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Divider, RadioButton, List, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function AddManualBooking({ navigation }: any) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [checkIn, setCheckIn] = useState(new Date());
    const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
    const [guests, setGuests] = useState('1');
    const [roomCount, setRoomCount] = useState(1);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [bookingGender, setBookingGender] = useState<'MALE' | 'FEMALE' | null>(null);
    const [paidAmount, setPaidAmount] = useState('0');
    const [bookingStatus, setBookingStatus] = useState('CONFIRMED');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);
    const [showRoomPicker, setShowRoomPicker] = useState(false);

    const { token } = useAuthStore();
    const { business } = useBusinessStore();
    const { colors, spacing } = useTheme();

    const isHostel = business?.type === 'HOSTEL';

    useEffect(() => {
        if (business) {
            fetchRooms();
        }
    }, [business]);

    const fetchRooms = async () => {
        if (!business) return;
        try {
            const res = await axios.get(`${API_URL}/rooms/business/${business.id}`);
            setRooms(res.data);
            if (res.data.length > 0) {
                setSelectedRoom(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBooking = async () => {
        if (!selectedRoom || !guestName) {
            Alert.alert('Error', 'Please select a room and enter guest name');
            return;
        }

        if (isHostel && !bookingGender) {
            Alert.alert('Error', 'Please select a gender for hostel booking');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                roomId: selectedRoom.id,
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                guests: parseInt(guests),
                roomCount,
                bookingGender,
                guestName: guestName + (guestPhone ? ` (${guestPhone})` : ''),
                isManual: true,
                status: bookingStatus,
                paidAmount: paidAmount
            };

            await axios.post(`${API_URL}/bookings`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Manual booking recorded!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ padding: spacing.m }}>
                <Text variant="headlineMedium" style={{ color: colors.primary, marginBottom: 20 }}>
                    Manual Booking
                </Text>

                <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: 10 }}>Guest Details</Text>
                        <TextInput
                            label="Guest Name"
                            value={guestName}
                            onChangeText={setGuestName}
                            mode="outlined"
                            style={styles.input}
                        />
                        <TextInput
                            label="Phone Number"
                            value={guestPhone}
                            onChangeText={setGuestPhone}
                            mode="outlined"
                            keyboardType="phone-pad"
                            style={styles.input}
                        />

                        {isHostel && (
                            <View style={{ marginTop: 10 }}>
                                <Text variant="labelLarge">Guest Gender</Text>
                                <RadioButton.Group onValueChange={value => setBookingGender(value as any)} value={bookingGender || ''}>
                                    <View style={{ flexDirection: 'row', gap: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <RadioButton value="MALE" />
                                            <Text>Male</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <RadioButton value="FEMALE" />
                                            <Text>Female</Text>
                                        </View>
                                    </View>
                                </RadioButton.Group>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: 10 }}>Room Selection</Text>

                        <List.Accordion
                            title={selectedRoom ? selectedRoom.name : "Select a Room"}
                            expanded={showRoomPicker}
                            onPress={() => setShowRoomPicker(!showRoomPicker)}
                            left={props => <List.Icon {...props} icon="door" />}
                        >
                            {rooms.map(room => (
                                <List.Item
                                    key={room.id}
                                    title={room.name}
                                    description={`GH₵${room.price}/${isHostel ? 'year' : 'night'}`}
                                    onPress={() => {
                                        setSelectedRoom(room);
                                        setShowRoomPicker(false);
                                    }}
                                />
                            ))}
                        </List.Accordion>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelLarge">Check In</Text>
                                <Button mode="outlined" onPress={() => setShowCheckIn(true)} style={styles.dateButton}>
                                    {checkIn.toDateString()}
                                </Button>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelLarge">Check Out</Text>
                                <Button mode="outlined" onPress={() => setShowCheckOut(true)} style={styles.dateButton}>
                                    {checkOut.toDateString()}
                                </Button>
                            </View>
                        </View>

                        {showCheckIn && (
                            <DateTimePicker
                                value={checkIn}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowCheckIn(false);
                                    if (date) setCheckIn(date);
                                }}
                            />
                        )}

                        {showCheckOut && (
                            <DateTimePicker
                                value={checkOut}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowCheckOut(false);
                                    if (date) setCheckOut(date);
                                }}
                            />
                        )}

                        <View style={[styles.row, { marginTop: 15 }]}>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelLarge">{isHostel ? 'Bed Spaces' : 'Rooms'}</Text>
                                <View style={styles.stepper}>
                                    <IconButton icon="minus" size={20} onPress={() => setRoomCount(Math.max(1, roomCount - 1))} />
                                    <Text>{roomCount}</Text>
                                    <IconButton icon="plus" size={20} onPress={() => setRoomCount(roomCount + 1)} />
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="labelLarge">Total Guests</Text>
                                <TextInput
                                    value={guests}
                                    onChangeText={setGuests}
                                    mode="outlined"
                                    keyboardType="numeric"
                                    dense
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: 10 }}>Payment & Status</Text>

                        <TextInput
                            label="Paid Amount (GH₵)"
                            value={paidAmount}
                            onChangeText={setPaidAmount}
                            mode="outlined"
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <Text variant="labelLarge" style={{ marginTop: 10 }}>Booking Status</Text>
                        <RadioButton.Group onValueChange={value => setBookingStatus(value)} value={bookingStatus}>
                            <View style={{ flexDirection: 'row', gap: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <RadioButton value="CONFIRMED" />
                                    <Text>Confirmed</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <RadioButton value="PENDING" />
                                    <Text>Pending</Text>
                                </View>
                            </View>
                        </RadioButton.Group>
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={handleCreateBooking}
                    loading={submitting}
                    disabled={submitting}
                    style={{ marginTop: 20, paddingVertical: 8 }}
                >
                    Record Booking
                </Button>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { marginBottom: 15, elevation: 2 },
    input: { marginBottom: 12 },
    row: { flexDirection: 'row', gap: 15, alignItems: 'flex-end' },
    dateButton: { marginTop: 5 },
    stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginTop: 5 },
});
