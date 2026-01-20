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
    const [aiInsight, setAiInsight] = useState<{ score: number, summary: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchAiInsight();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/analytics/manager/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchAiInsight = async () => {
        if (!business?.id) return;
        setAiLoading(true);
        try {
            const response = await axios.get(`${API_URL}/ai/sentiment/${business.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAiInsight(response.data);
        } catch (error) {
            console.error('Error fetching AI insight:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        Promise.all([fetchStats(), fetchAiInsight()]).finally(() => {
            setLoading(false);
            setRefreshing(false);
        });
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

                {/* AI Insights Section */}
                <View style={[styles.card, cardStyle, { padding: spacing.l, marginTop: spacing.m, borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
                    <View style={[styles.row, { alignItems: 'center', marginBottom: spacing.s }]}>
                        <AppText variant="h3" style={{ color: colors.primary, flex: 1 }}>AI Customer Insights ✨</AppText>
                        {aiInsight && (
                            <AppText variant="h3">
                                {aiInsight.score > 0.5 ? '😊' : aiInsight.score > 0 ? '🙂' : aiInsight.score === 0 ? '😐' : '☹️'}
                            </AppText>
                        )}
                    </View>

                    {aiLoading ? (
                        <AppText color={colors.textLight}>BiteBot is analyzing reviews...</AppText>
                    ) : aiInsight ? (
                        <>
                            <AppText variant="body" style={{ lineHeight: 20, color: colors.text }}>
                                {aiInsight.summary}
                            </AppText>
                            <View style={{ marginTop: spacing.s, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1, height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden' }}>
                                    <View style={{
                                        width: `${((aiInsight.score + 1) / 2) * 100}%`,
                                        height: '100%',
                                        backgroundColor: aiInsight.score > 0 ? colors.success : colors.error
                                    }} />
                                </View>
                                <AppText variant="caption" style={{ marginLeft: spacing.s, color: colors.textLight }}>
                                    {Math.round(((aiInsight.score + 1) / 2) * 100)}% Positive
                                </AppText>
                            </View>
                        </>
                    ) : (
                        <AppText color={colors.textLight}>Not enough reviews yet for AI analysis.</AppText>
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
