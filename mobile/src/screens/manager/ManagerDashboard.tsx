import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function ManagerDashboard({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const setBusiness = useBusinessStore((state) => state.setBusiness);
    const logout = useAuthStore((state) => state.logout);
    const clearBusiness = useBusinessStore((state) => state.clearBusiness);

    useEffect(() => {
        fetchBusiness();
    }, []);

    const fetchBusiness = async () => {
        try {
            const response = await axios.get(`${API_URL}/business/me/business`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBusiness(response.data);
        } catch (error) {
            console.error('Failed to fetch business', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    clearBusiness();
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!business) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text variant="headlineSmall" style={styles.emptyTitle}>
                        Welcome, Manager!
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptyText}>
                        You haven't set up your business yet.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('BusinessSetup')}
                        style={styles.button}
                    >
                        Set Up Business
                    </Button>
                    <Button mode="text" onPress={handleLogout} style={styles.logoutBtn}>
                        Logout
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    const isRestaurant = business.type === 'RESTAURANT';
    const { colors, spacing } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.m }]}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
                    {business.name}
                </Text>
                <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.textLight }]}>
                    {business.type}
                </Text>

                <View style={[styles.statsRow, { gap: spacing.s }]}>
                    <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Card.Content>
                            <Text variant="bodySmall" style={{ color: colors.textLight }}>
                                Total Views
                            </Text>
                            <Text variant="headlineSmall" style={[styles.statValue, { color: colors.primary }]}>
                                0
                            </Text>
                        </Card.Content>
                    </Card>

                    <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
                        <Card.Content>
                            <Text variant="bodySmall" style={{ color: colors.textLight }}>
                                {isRestaurant ? 'Orders' : 'Bookings'}
                            </Text>
                            <Text variant="headlineSmall" style={[styles.statValue, { color: colors.primary }]}>
                                0
                            </Text>
                        </Card.Content>
                    </Card>
                </View>

                <Card style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Card.Content>
                        <Text variant="titleMedium" style={{ marginBottom: spacing.m, color: colors.text }}>Quick Actions</Text>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate(isRestaurant ? 'MenuList' : 'RoomList')}
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            icon={isRestaurant ? 'food' : 'bed'}
                            textColor={colors.white}
                        >
                            {isRestaurant ? 'Manage Menu' : 'Manage Rooms'}
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={[styles.actionButton, { borderColor: colors.primary }]}
                            icon="cog"
                            textColor={colors.primary}
                        >
                            Business Settings
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('OrderList')}
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            icon="clipboard-list"
                            textColor={colors.white}
                        >
                            Manage Orders
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => navigation.navigate('ManagerWallet')}
                            style={[styles.actionButton, { borderColor: colors.primary }]}
                            icon="wallet"
                            textColor={colors.primary}
                        >
                            Wallet & Earnings
                        </Button>
                        <Button
                            mode="text"
                            onPress={handleLogout}
                            style={[styles.actionButton]}
                            icon="logout"
                            textColor={colors.error}
                        >
                            Logout
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { marginBottom: 5, fontWeight: 'bold' },
    subtitle: { marginBottom: 20, color: '#666' },
    emptyTitle: { marginBottom: 10, textAlign: 'center' },
    emptyText: { marginBottom: 30, textAlign: 'center', color: '#666' },
    button: { paddingVertical: 5 },
    logoutBtn: { marginTop: 15 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: { flex: 1 },
    statLabel: { color: '#666', marginBottom: 5 },
    statValue: { fontWeight: 'bold' },
    card: { marginBottom: 15 },
    actionButton: { marginTop: 10 },
});
