import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Button, Card, Divider, IconButton, TextInput, Portal, Modal } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import PaymentWebView from '../../components/ui/PaymentWebView';
import CustomHeader from '../../components/navigation/CustomHeader';
import AppText from '../../components/ui/AppText';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function WalletScreen({ navigation }: any) {
    const { colors, spacing, isDark } = useTheme();
    const { token } = useAuthStore();

    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Top Up State
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [paymentUrl, setPaymentUrl] = useState('');
    const [showWebView, setShowWebView] = useState(false);
    const [currentReference, setCurrentReference] = useState('');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const response = await axios.get(`${API_URL}/wallet`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBalance(response.data.balance);
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Error fetching wallet:', error);
            // Alert.alert('Error', 'Failed to load wallet data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleInitializeTopUp = async () => {
        if (!topUpAmount || isNaN(Number(topUpAmount)) || Number(topUpAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/wallet/top-up/initialize`, {
                amount: Number(topUpAmount)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPaymentUrl(response.data.authorization_url);
            setCurrentReference(response.data.reference);
            setShowTopUpModal(false);
            setShowWebView(true);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to initialize top-up';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTopUp = async (reference: string) => {
        try {
            const response = await axios.post(`${API_URL}/wallet/top-up/verify`, {
                reference
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Wallet credited successfully! 🚀');
            setBalance(response.data.balance); // Update balance locally
            fetchWalletData(); // Refresh history
        } catch (error) {
            Alert.alert('Error', 'Verification failed. Please contact support.');
        }
    };

    const renderTransaction = ({ item }: any) => {
        const isCredit = item.type === 'CREDIT';
        const successBg = isDark ? '#1B3320' : '#E8F5E9';
        const errorBg = isDark ? '#3D1B1B' : '#FFEBEE';

        return (
            <Card style={[styles.transactionCard, { backgroundColor: colors.surface }]} mode="contained">
                <View style={styles.transactionRow}>
                    <View style={[styles.iconBox, { backgroundColor: isCredit ? successBg : errorBg }]}>
                        <IconButton
                            icon={isCredit ? 'arrow-down-left' : 'arrow-up-right'}
                            iconColor={isCredit ? colors.success : colors.error}
                            size={20}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <AppText bold>{item.description || (isCredit ? 'Top Up' : 'Payment')}</AppText>
                        <AppText variant="caption" color={colors.textLight}>
                            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                        </AppText>
                    </View>
                    <AppText bold color={isCredit ? colors.success : colors.text}>
                        {isCredit ? '+' : '-'} GH₵{Number(item.amount).toFixed(2)}
                    </AppText>
                </View>
            </Card>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="My Wallet" showBack />

            <View style={styles.content}>
                {/* Balance Card */}
                <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <View style={{ padding: 24, alignItems: 'center' }}>
                        <AppText color="white" style={{ opacity: 0.8 }}>Available Balance</AppText>
                        <Text variant="displayMedium" style={{ color: 'white', fontWeight: 'bold', marginVertical: 8 }}>
                            GH₵{Number(balance).toFixed(2)}
                        </Text>
                        <Button
                            mode="contained"
                            buttonColor="white"
                            textColor={colors.primary}
                            icon="plus"
                            onPress={() => setShowTopUpModal(true)}
                            style={{ paddingHorizontal: 16 }}
                        >
                            Top Up
                        </Button>
                    </View>
                </Card>

                {/* Transactions */}
                <AppText variant="h3" style={{ margin: 16 }}>Recent Transactions</AppText>

                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWalletData(); }} colors={[colors.primary]} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <AppText color={colors.textLight}>No transactions yet</AppText>
                        </View>
                    }
                />
            </View>

            {/* Top Up Modal */}
            <Portal>
                <Modal visible={showTopUpModal} onDismiss={() => setShowTopUpModal(false)} contentContainerStyle={styles.modal}>
                    <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12 }}>
                        <AppText variant="h3" style={{ textAlign: 'center', marginBottom: 16 }}>Top Up Wallet</AppText>
                        <TextInput
                            label="Amount (GHS)"
                            value={topUpAmount}
                            onChangeText={setTopUpAmount}
                            keyboardType="numeric"
                            mode="outlined"
                            left={<TextInput.Affix text="GH₵" />}
                            style={{ marginBottom: 16, backgroundColor: colors.surface }}
                            autoFocus
                            theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.textLight } }}
                        />
                        <Button mode="contained" onPress={handleInitializeTopUp} loading={loading} disabled={loading} buttonColor={colors.primary}>
                            Proceed to Pay
                        </Button>
                    </View>
                </Modal>
            </Portal>

            {/* Paystack WebView */}
            <PaymentWebView
                visible={showWebView}
                url={paymentUrl}
                onClose={() => setShowWebView(false)}
                onSuccess={(ref) => {
                    setShowWebView(false);
                    handleVerifyTopUp(ref || currentReference);
                }}
                onCancel={() => setShowWebView(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    balanceCard: {
        margin: 16,
        borderRadius: 20,
        elevation: 4,
    },
    transactionCard: {
        marginBottom: 8,
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        padding: 20
    }
});
