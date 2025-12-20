import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, SIZES, SHADOWS, SPACING } from '../../theme';

interface AppCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    noPadding?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppCard({ children, style, onPress, noPadding = false }: AppCardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={() => (scale.value = withSpring(0.98))}
                onPressOut={() => (scale.value = withSpring(1))}
                style={[styles.container, noPadding && { padding: 0 }, style, animatedStyle]}
            >
                {children}
            </AnimatedPressable>
        );
    }

    return (
        <View style={[styles.container, noPadding && { padding: 0 }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius.l,
        padding: SPACING.m,
        ...SHADOWS.light,
    },
});
