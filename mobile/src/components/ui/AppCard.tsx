import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface AppCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    noPadding?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppCard({ children, style, onPress, noPadding = false }: AppCardProps) {
    const { colors, sizes, shadows, spacing } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const containerStyle = [
        styles.container,
        {
            backgroundColor: colors.surface,
            borderRadius: sizes.radius.l,
            padding: noPadding ? 0 : spacing.m,
            ...shadows.light,
        },
        style
    ];

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={() => (scale.value = withSpring(0.98))}
                onPressOut={() => (scale.value = withSpring(1))}
                style={[containerStyle, animatedStyle]}
            >
                {children}
            </AnimatedPressable>
        );
    }

    return (
        <View style={containerStyle}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Shared fallback removed, using theme values
    },
});
