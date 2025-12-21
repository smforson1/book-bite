import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from '../ui/SkeletonLoader';
import { SPACING, SIZES } from '../../theme';
import AppCard from '../ui/AppCard';

export default function BusinessCardSkeleton() {
    return (
        <AppCard style={styles.card} noPadding>
            {/* Image skeleton */}
            <SkeletonLoader
                width="100%"
                height={180}
                borderRadius={0}
                style={{ borderTopLeftRadius: SIZES.radius.l, borderTopRightRadius: SIZES.radius.l }}
            />

            {/* Content skeleton */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <SkeletonLoader width="60%" height={24} style={{ marginBottom: SPACING.xs }} />
                    <SkeletonLoader width={60} height={24} borderRadius={SIZES.radius.s} />
                </View>

                <SkeletonLoader width="80%" height={16} style={{ marginBottom: SPACING.xs }} />
                <SkeletonLoader width="40%" height={16} />
            </View>
        </AppCard>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: SPACING.l,
    },
    content: {
        padding: SPACING.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
});
