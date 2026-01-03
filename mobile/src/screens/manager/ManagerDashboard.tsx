import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, IconButton, Avatar } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import CustomHeader from '../../components/navigation/CustomHeader';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function ManagerDashboard({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ revenue: 0, ordersCount: 0 });
    const [activity, setActivity] = useState<any[]>([]);
    const [wallet, setWallet] = useState<any>(null);

    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const setBusiness = useBusinessStore((state) => state.setBusiness);
    const { colors, spacing, sizes, shadows } = useTheme();

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    const fetchData = useCallback(async () => {
        try {
            const [busRes, walletRes, activityRes] = await Promise.all([
                axios.get(`${API_URL}/business/me/business`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/wallet`, { headers: { Authorization: `Bearer ${token}` } }),
                business?.type === 'RESTAURANT'
                    ? axios.get(`${API_URL}/orders/manager`, { headers: { Authorization: `Bearer ${token}` } })
                    : axios.get(`${API_URL}/bookings/manager`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setBusiness(busRes.data);
            setWallet(walletRes.data);

            const rawActivity = activityRes.data || [];
            setActivity(rawActivity.slice(0, 5));

            // Calculate basic stats for today
            const today = new Date().toISOString().split('T')[0];
            const todayActivity = rawActivity.filter((a: any) => a.createdAt.startsWith(today));
            const revenue = todayActivity.reduce((acc: number, curr: any) => acc + Number(curr.totalPrice), 0);

            setStats({
                revenue,
                ordersCount: todayActivity.length
            });

        } catch (error) {
            console.error('Dashboard fetch error', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, business?.type, setBusiness]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.center}>
                    <Text>Loading Dashboard...</Text>
                </View>
            </View>
        );
    }

    if (!business) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <CustomHeader
                    title="Welcome!"
                    rightAction={
                        <IconButton
                            icon="account-circle-outline"
                            size={24}
                            iconColor={colors.text}
                            onPress={() => navigation.navigate('Profile')}
                        />
                    }
                />
                <View style={styles.center}>
                    <Avatar.Icon size={80} icon="store-plus" style={{ backgroundColor: colors.primary + '20' }} color={colors.primary} />
                    <AppText variant="h2" style={{ marginTop: 20 }}>Welcome, Manager!</AppText>
                    <AppText color={colors.textLight} center style={{ marginHorizontal: 40, marginTop: 10 }}>
                        Time to bring your business online and start taking orders.
                    </AppText>
                    <AppCard
                        onPress={() => navigation.navigate('BusinessSetup')}
                        style={{ marginTop: 30, backgroundColor: colors.primary, width: '80%', alignItems: 'center' }}
                    >
                        <AppText color={colors.white} bold>Set Up My Business</AppText>
                    </AppCard>
                </View>
            </View>
        );
    }

    const isRestaurant = business.type === 'RESTAURANT';

    const ActionCard = ({ icon, label, subLabel, onPress, color }: any) => (
        <AppCard onPress={onPress} style={[styles.actionCard, { flex: 1 }]}>
            <View style={[styles.iconBox, { backgroundColor: (color || colors.primary) + '15' }]}>
                <IconButton icon={icon} iconColor={color || colors.primary} size={24} />
            </View>
            <AppText variant="label" style={{ marginTop: 12 }}>{label}</AppText>
            {subLabel && <AppText variant="caption" color={colors.textLight}>{subLabel}</AppText>}
        </AppCard>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader
                title={business.name}
                rightAction={
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton icon="bell-outline" size={24} iconColor={colors.text} onPress={() => navigation.navigate('Notifications')} />
                        <IconButton
                            icon="account-circle-outline"
                            size={24}
                            iconColor={colors.text}
                            onPress={() => navigation.navigate('Profile')}
                        />
                    </View>
                }
            />
            <ScrollView
                contentContainerStyle={[styles.content, { padding: spacing.m }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <AppCard style={styles.statBox}>
                        <AppText variant="caption" color={colors.textLight}>Revenue Today</AppText>
                        <AppText variant="h2" color={colors.primary}>GH₵{stats.revenue.toLocaleString()}</AppText>
                    </AppCard>
                    <AppCard style={styles.statBox}>
                        <AppText variant="caption" color={colors.textLight}>{isRestaurant ? 'Orders' : 'Bookings'}</AppText>
                        <AppText variant="h2" color={colors.secondary || '#546E7A'}>{stats.ordersCount}</AppText>
                    </AppCard>
                </View>

                {/* Quick Actions Grid */}
                <AppText variant="h3" style={styles.sectionTitle}>Quick Actions</AppText>
                <View style={styles.grid}>
                    <View style={styles.gridRow}>
                        <ActionCard
                            icon={isRestaurant ? 'food-apple' : 'bed-double'}
                            label={isRestaurant ? 'Menu' : 'Rooms'}
                            subLabel="Inventory"
                            onPress={() => navigation.navigate('Manage')}
                        />
                        <ActionCard
                            icon="clipboard-list-outline"
                            label="Orders"
                            subLabel="Active Requests"
                            onPress={() => navigation.navigate('Orders')}
                            color="#FB8C00"
                        />
                    </View>
                    <View style={styles.gridRow}>
                        <ActionCard
                            icon="wallet-outline"
                            label="Wallet"
                            subLabel={`GH₵${Number(wallet?.balance || 0).toLocaleString()}`}
                            onPress={() => navigation.navigate('Wallet')}
                            color="#43A047"
                        />
                        {!isRestaurant ? (
                            <ActionCard
                                icon="calendar-plus"
                                label="Manual Booking"
                                subLabel="Record Walk-in"
                                onPress={() => navigation.navigate('AddManualBooking')}
                                color="#E91E63"
                            />
                        ) : (
                            <ActionCard
                                icon="cog-outline"
                                label="Settings"
                                subLabel="Business Info"
                                onPress={() => navigation.navigate('BusinessSetup')}
                                color="#78909C"
                            />
                        )}
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.activityHeader}>
                    <AppText variant="h3">Recent Activity</AppText>
                    <IconButton icon="chevron-right" size={20} onPress={() => navigation.navigate(isRestaurant ? 'Orders' : 'Orders')} />
                </View>

                {activity.length === 0 ? (
                    <AppCard style={styles.emptyActivity}>
                        <AppText color={colors.textLight} center>No recent activity found.</AppText>
                    </AppCard>
                ) : (
                    activity.map((item) => (
                        <AppCard
                            key={item.id}
                            style={styles.activityItem}
                            onPress={() => navigation.navigate(isRestaurant ? 'OrderDetail' : 'BookingDetail', isRestaurant ? { order: item } : { booking: item })}
                        >
                            <View style={styles.activityRow}>
                                <Avatar.Text
                                    size={40}
                                    label={item.user?.name?.[0] || 'U'}
                                    style={{ backgroundColor: colors.primary + '20' }}
                                    labelStyle={{ color: colors.primary, fontSize: 16 }}
                                />
                                <View style={styles.activityInfo}>
                                    <View style={styles.activityHeaderRow}>
                                        <AppText bold>{item.user?.name || 'Guest'}</AppText>
                                        <AppText variant="caption" color={colors.primary} bold>{item.status}</AppText>
                                    </View>
                                    <AppText variant="caption" color={colors.textLight}>
                                        {formatDate(item.createdAt)} • GH₵{Number(item.totalPrice).toLocaleString()}
                                    </AppText>
                                </View>
                            </View>
                        </AppCard>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statBox: { flex: 1, padding: 16 },
    sectionTitle: { marginBottom: 16, marginLeft: 4 },
    grid: { gap: 12 },
    gridRow: { flexDirection: 'row', gap: 12 },
    actionCard: { padding: 16, alignItems: 'flex-start' },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12, marginLeft: 4 },
    activityItem: { marginBottom: 8, padding: 12 },
    activityRow: { flexDirection: 'row', alignItems: 'center' },
    activityInfo: { flex: 1, marginLeft: 12 },
    activityHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    emptyActivity: { padding: 30, alignItems: 'center' }
});
