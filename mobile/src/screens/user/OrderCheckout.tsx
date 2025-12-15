import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function OrderCheckout({ route, navigation }: any) {
    const { cart, business } = route.params;
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const token = useAuthStore((state) => state.token);

    const total = cart.reduce((sum: number, item: any) => sum + Number(item.price), 0);

    const handleOrder = async () => {
        if (!address) {
            Alert.alert('Error', 'Please enter delivery address');
            return;
        }

        setLoading(true);
        try {
            // consolidate items
            const itemsMap = new Map();
            cart.forEach((item: any) => {
                if (itemsMap.has(item.id)) {
                    itemsMap.get(item.id).quantity += 1;
                } else {
                    itemsMap.set(item.id, { menuItemId: item.id, quantity: 1, name: item.name, price: item.price });
                }
            });

            const items = Array.from(itemsMap.values());

            await axios.post(
                `${API_URL}/orders`,
                {
                    businessId: business.id,
                    items,
                    deliveryAddress: address,
                    notes,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Success', 'Order placed successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) }, // Bookings tab shows orders too
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Complete Order
                </Text>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleLarge">{business.name}</Text>
                        <Divider style={{ marginVertical: 10 }} />
                        {cart.map((item: any, index: number) => (
                            <View key={index} style={styles.itemRow}>
                                <Text>{item.name}</Text>
                                <Text>${item.price}</Text>
                            </View>
                        ))}
                        <View style={[styles.itemRow, styles.totalRow]}>
                            <Text variant="titleMedium">Total</Text>
                            <Text variant="titleMedium">${total}</Text>
                        </View>
                    </Card.Content>
                </Card>

                <TextInput
                    label="Delivery Address *"
                    value={address}
                    onChangeText={setAddress}
                    mode="outlined"
                    style={styles.input}
                    multiline
                />

                <TextInput
                    label="Order Notes"
                    value={notes}
                    onChangeText={setNotes}
                    mode="outlined"
                    style={styles.input}
                    multiline
                />

                <Button
                    mode="contained"
                    onPress={handleOrder}
                    style={styles.button}
                    loading={loading}
                    disabled={loading}
                >
                    Place Order
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    title: { marginBottom: 20, textAlign: 'center' },
    card: { marginBottom: 20 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    input: { marginBottom: 15 },
    button: { marginTop: 10, paddingVertical: 5 },
});
