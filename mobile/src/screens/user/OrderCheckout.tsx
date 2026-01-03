import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import PaymentWebView from '../../components/ui/PaymentWebView';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function OrderCheckout({ route, navigation }: any) {
    const { cart, business } = route.params;
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Payment State
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [showWebView, setShowWebView] = useState(false);
    const [currentReference, setCurrentReference] = useState('');

    const { token, user } = useAuthStore((state) => state);
    const { clearCart } = useCartStore();
    const { colors } = useTheme();

    const total = cart.reduce((sum: number, item: any) => sum + Number(item.price), 0);

    const handlePaymentSuccess = async (res: any) => {
        const reference = res.reference || currentReference;

        if (!reference) {
            Alert.alert('Error', 'Payment reference missing.');
            return;
        }

        try {
            // 3. Verify Payment & Confirm Order
            await axios.post(`${API_URL}/payment/verify`, {
                reference,
                email: user?.email,
                amount: total,
                metadata: {
                    purpose: 'ORDER',
                    orderId: currentOrderId,
                    userId: user?.id
                }
            });

            clearCart();
            Alert.alert('Success', 'Order placed and paid successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) },
            ]);
        } catch (error) {
            console.error('Payment verification failed', error);
            Alert.alert('Payment Error', 'Payment was successful but verification failed. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

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

            // 1. Create Pending Order
            const response = await axios.post(
                `${API_URL}/orders`,
                {
                    businessId: business.id,
                    items,
                    deliveryAddress: address,
                    notes,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCurrentOrderId(response.data.id);

            // 2. Trigger Payment
            const payRes = await axios.post(`${API_URL}/payment/initialize`, {
                email: user?.email || 'guest@example.com',
                amount: total,
                metadata: {
                    purpose: 'ORDER',
                    orderId: response.data.id,
                    userId: user?.id
                }
            });

            setPaymentUrl(payRes.data.authorization_url);
            setCurrentReference(payRes.data.reference);
            setShowWebView(true);

        } catch (error: any) {
            console.error('Initialize error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || error.message;
            Alert.alert('Error', `Order initiation failed: ${errorMsg}`);
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={[styles.content, { padding: 20 }]}>
                <AppText variant="h1" style={styles.title} center>
                    Complete Order
                </AppText>

                <AppCard style={styles.card}>
                    <AppText variant="h2">{business.name}</AppText>
                    <Divider style={{ marginVertical: 10, backgroundColor: colors.border }} />
                    {cart.map((item: any, index: number) => (
                        <View key={index} style={styles.itemRow}>
                            <AppText>{item.name}</AppText>
                            <AppText>GH₵{item.price}</AppText>
                        </View>
                    ))}
                    <View style={[styles.itemRow, styles.totalRow, { borderTopColor: colors.border }]}>
                        <AppText variant="h3">Total</AppText>
                        <AppText variant="h3">GH₵{total}</AppText>
                    </View>
                </AppCard>

                <TextInput
                    label="Delivery Address *"
                    value={address}
                    onChangeText={setAddress}
                    mode="outlined"
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    multiline
                    theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.textLight } }}
                />

                <TextInput
                    label="Order Notes"
                    value={notes}
                    onChangeText={setNotes}
                    mode="outlined"
                    style={[styles.input, { backgroundColor: colors.surface }]}
                    multiline
                    theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.textLight } }}
                />

                <AppButton
                    title="Pay & Place Order"
                    onPress={handleOrder}
                    isLoading={loading}
                />

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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {},
    title: { marginBottom: 20 },
    card: { marginBottom: 20 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
    input: { marginBottom: 15 },
});
