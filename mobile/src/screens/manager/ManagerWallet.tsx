import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, Card, Button, Divider, List, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function ManagerWallet({ navigation }: any) {
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    const theme = useTheme();
    const token = useAuthStore((state) => state.token);

    const fetchWallet = async () => {
        try {
            const response = await axios.get(`${API_URL}/wallet`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWallet(response.data);
        } catch (error) {
            console.error('Fetch wallet error', error);
            // Alert.alert('Error', 'Failed to fetch wallet information');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWallet();
    };

    const handlePayout = async () => {
        if (!wallet || Number(wallet.balance) <= 0) {
            Alert.alert('Error', 'Insufficient balance for payout');
            return;
        }

        Alert.alert(
            'Request Payout',
            `Are you sure you want to request a payout of ${wallet.currency} ${wallet.balance}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setWithdrawing(true);
                        try {
                            await axios.post(
                                `${API_URL}/wallet/payout`,
                                { amount: Number(wallet.balance) },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            Alert.alert('Success', 'Payout request submitted successfully');
                            fetchWallet();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Payout request failed');
                        } finally {
                            setWithdrawing(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Loading Wallet...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text variant="headlineMedium" style={styles.title}>My Wallet</Text>

                <Card style={styles.balanceCard}>
                    <Card.Content style={{ alignItems: 'center' }}>
                        <Text variant="titleMedium" style={{ color: '#fff', opacity: 0.8 }}>Current Balance</Text>
                        <Text variant="displayMedium" style={{ color: '#fff', fontWeight: 'bold', marginVertical: 10 }}>
                            {wallet?.currency} {Number(wallet?.balance || 0).toLocaleString()}
                        </Text>
                        <Button
                            mode="contained"
                            onPress={handlePayout}
                            loading={withdrawing}
                            disabled={!wallet || Number(wallet.balance) <= 0 || withdrawing}
                            style={styles.withdrawButton}
                            textColor={theme.colors.primary}
                            buttonColor="#fff"
                        >
                            Request Payout
                        </Button>
                    </Card.Content>
                </Card>

                <Text variant="titleLarge" style={styles.sectionTitle}>Recent Transactions</Text>

                <Card>
                    <Card.Content style={{ padding: 0 }}>
                        {wallet?.transactions?.length === 0 ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text>No transactions yet.</Text>
                            </View>
                        ) : (
                            wallet?.transactions?.map((tx: any, index: number) => (
                                <View key={tx.id}>
                                    <List.Item
                                        title={tx.type === 'CREDIT' ? 'Earnings' : 'Payout'}
                                        description={`${tx.description || ''} • ${new Date(tx.createdAt).toLocaleDateString()}`}
                                        left={props => <List.Icon {...props} icon={tx.type === 'CREDIT' ? 'arrow-bottom-left' : 'arrow-top-right'} color={tx.type === 'CREDIT' ? 'green' : 'red'} />}
                                        right={props => (
                                            <View {...props} style={{ justifyContent: 'center' }}>
                                                <Text style={{
                                                    color: tx.type === 'CREDIT' ? 'green' : 'red',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {tx.type === 'CREDIT' ? '+' : '-'}{wallet.currency} {Number(tx.amount).toLocaleString()}
                                                </Text>
                                                <Text variant="labelSmall" style={{ textAlign: 'right', color: '#666' }}>
                                                    {tx.status}
                                                </Text>
                                            </View>
                                        )}
                                    />
                                    {index < wallet.transactions.length - 1 && <Divider />}
                                </View>
                            ))
                        )}
                    </Card.Content>
                </Card>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    title: { marginBottom: 20, fontWeight: 'bold' },
    balanceCard: { backgroundColor: '#6200ee', marginBottom: 24, paddingVertical: 10 },
    withdrawButton: { marginTop: 10, width: '100%' },
    sectionTitle: { marginBottom: 10 },
});
