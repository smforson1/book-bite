import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from '../ui/SkeletonLoader';
import { SPACING, SIZES } from '../../theme';

export default function BusinessDetailsSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header Image Skeleton */}
            <SkeletonLoader width="100%" height={250} borderRadius={0} />

            {/* Title and Info */}
            <View style={styles.content}>
                <SkeletonLoader width="70%" height={28} style={{ marginBottom: SPACING.s }} />
                <SkeletonLoader width="50%" height={16} style={{ marginBottom: SPACING.xs }} />
                <SkeletonLoader width="90%" height={16} style={{ marginBottom: SPACING.m }} />

                {/* Section Title */}
                <SkeletonLoader width="40%" height={24} style={{ marginTop: SPACING.l, marginBottom: SPACING.m }} />

                {/* Card Skeletons */}
                <View style={styles.card}>
                    <SkeletonLoader width="100%" height={150} borderRadius={SIZES.radius.l} style={{ marginBottom: SPACING.m }} />
                    <SkeletonLoader width="60%" height={20} style={{ marginBottom: SPACING.xs }} />
                    <SkeletonLoader width="40%" height={16} style={{ marginBottom: SPACING.xs }} />
                    <SkeletonLoader width="30%" height={20} />
                </View>

                <View style={styles.card}>
                    <SkeletonLoader width="100%" height={150} borderRadius={SIZES.radius.l} style={{ marginBottom: SPACING.m }} />
                    <SkeletonLoader width="60%" height={20} style={{ marginBottom: SPACING.xs }} />
                    <SkeletonLoader width="40%" height={16} style={{ marginBottom: SPACING.xs }} />
                    <SkeletonLoader width="30%" height={20} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: SPACING.m,
    },
    card: {
        marginBottom: SPACING.l,
        padding: SPACING.m,
        backgroundColor: '#fff',
        borderRadius: SIZES.radius.l,
    },
});
