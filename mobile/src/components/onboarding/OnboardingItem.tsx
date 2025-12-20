import React from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { COLORS, SPACING, SIZES } from '../../theme';
import AppText from '../ui/AppText';

export interface OnboardingItemProps {
    item: {
        id: string;
        title: string;
        description: string;
        image: any;
    };
}

export default function OnboardingItem({ item }: OnboardingItemProps) {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <Image source={item.image} style={[styles.image, { width: width * 0.8 }]} resizeMode="contain" />
            <View style={styles.content}>
                <AppText variant="h1" color={COLORS.primary} center style={styles.title}>
                    {item.title}
                </AppText>
                <AppText variant="body" color={COLORS.textLight} center style={styles.description}>
                    {item.description}
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        flex: 0.6,
        justifyContent: 'center',
    },
    content: {
        flex: 0.4,
        paddingHorizontal: SPACING.l,
    },
    title: {
        marginBottom: SPACING.m,
    },
    description: {
        lineHeight: 24,
    },
});
