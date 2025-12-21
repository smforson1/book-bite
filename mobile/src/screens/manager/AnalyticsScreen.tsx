import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { COLORS, SPACING } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

interface Stats {
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    totalOrders: number;
    completedOrders: number;
}

export default function AnalyticsScreen() {
    const { token } = useAuthStore();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/analytics/manager/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <AppText>Loading analytics...</AppText>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.content}>
                <AppText variant="h2" style={styles.title}>Business Analytics</AppText>

                <View style={styles.card}>
                    <AppText variant="h3" style={styles.cardTitle}>Revenue</AppText>
                    <AppText style={styles.statValue}>GH₵{stats?.totalRevenue.toFixed(2) || '0.00'}</AppText>
                    <AppText style={styles.statLabel}>Total Revenue</AppText>
                </View>

                <View style={styles.row}>
                    <View style={[styles.card, styles.halfCard]}>
                        <AppText variant="h3" style={styles.cardTitle}>Bookings</AppText>
                        <AppText style={styles.statValue}>{stats?.totalBookings || 0}</AppText>
                        <AppText style={styles.statLabel}>Total</AppText>
                        <AppText style={styles.statSubValue}>{stats?.confirmedBookings || 0} Confirmed</AppText>
                    </View>

                    <View style={[styles.card, styles.halfCard]}>
                        <AppText variant="h3" style={styles.cardTitle}>Orders</AppText>
                        <AppText style={styles.statValue}>{stats?.totalOrders || 0}</AppText>
                        <AppText style={styles.statLabel}>Total</AppText>
                        <AppText style={styles.statSubValue}>{stats?.completedOrders || 0} Completed</AppText>
                    </View>
                </View>

                <AppText style={styles.note}>
                    Pull down to refresh analytics data
                </AppText>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.md,
    },
    title: {
        marginBottom: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    halfCard: {
        flex: 1,
        marginHorizontal: SPACING.xs,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -SPACING.xs,
    },
    cardTitle: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    statSubValue: {
        color: COLORS.success,
        fontSize: 14,
        marginTop: SPACING.xs,
    },
    note: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: SPACING.md,
    },
});
