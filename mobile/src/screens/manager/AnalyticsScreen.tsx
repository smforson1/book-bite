import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import AppText from '../../components/ui/AppText';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
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
    const { business } = useBusinessStore();
    const { colors, spacing, shadows } = useTheme();

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
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <AppText>Loading analytics...</AppText>
            </View>
        );
    }

    const isRestaurant = business?.type === 'RESTAURANT';

    // Dynamic Styles Helper
    const cardStyle = {
        backgroundColor: colors.surface,
        shadowColor: shadows.medium.shadowColor,
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
            <View style={[styles.content, { padding: spacing.m }]}>
                <AppText variant="h2" style={[styles.title, { marginBottom: spacing.l }]}>Business Analytics</AppText>

                <View style={[styles.card, cardStyle, { padding: spacing.l, marginBottom: spacing.m }]}>
                    <AppText variant="h3" style={{ color: colors.textLight, marginBottom: spacing.s }}>Revenue</AppText>
                    <AppText style={[styles.statValue, { color: colors.primary }]}>GH₵{stats?.totalRevenue.toFixed(2) || '0.00'}</AppText>
                    <AppText style={{ color: colors.textLight, fontSize: 12 }}>Total Revenue</AppText>
                </View>

                {/* Show Bookings OR Orders based on business type */}
                <View style={[styles.row, { marginHorizontal: -spacing.xs }]}>
                    {!isRestaurant && (
                        <View style={[styles.card, styles.halfCard, cardStyle, { marginHorizontal: spacing.xs }]}>
                            <AppText variant="h3" style={{ color: colors.textLight, marginBottom: spacing.s }}>Bookings</AppText>
                            <AppText style={[styles.statValue, { color: colors.primary }]}>{stats?.totalBookings || 0}</AppText>
                            <AppText style={{ color: colors.textLight, fontSize: 12 }}>Total</AppText>
                            <AppText style={{ color: colors.success, fontSize: 14, marginTop: spacing.xs }}>{stats?.confirmedBookings || 0} Confirmed</AppText>
                        </View>
                    )}

                    {isRestaurant && (
                        <View style={[styles.card, styles.halfCard, cardStyle, { marginHorizontal: spacing.xs }]}>
                            <AppText variant="h3" style={{ color: colors.textLight, marginBottom: spacing.s }}>Orders</AppText>
                            <AppText style={[styles.statValue, { color: colors.primary }]}>{stats?.totalOrders || 0}</AppText>
                            <AppText style={{ color: colors.textLight, fontSize: 12 }}>Total</AppText>
                            <AppText style={{ color: colors.success, fontSize: 14, marginTop: spacing.xs }}>{stats?.completedOrders || 0} Completed</AppText>
                        </View>
                    )}
                </View>

                <AppText style={{ textAlign: 'center', color: colors.textLight, fontSize: 12, marginTop: spacing.m }}>
                    Pull down to refresh analytics data
                </AppText>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        // padding handled inline
    },
    title: {
        // margin handled inline
    },
    card: {
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    halfCard: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
});
