import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES, SPACING } from '../../theme';
import AppText from './AppText';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    disabled?: boolean;
    style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppButton({
    title,
    onPress,
    variant = 'primary',
    isLoading = false,
    disabled = false
}: AppButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const bgColor = variant === 'primary' ? COLORS.primary
        : variant === 'secondary' ? COLORS.secondary
            : variant === 'ghost' ? 'transparent'
                : 'transparent';

    const textColor = variant === 'primary' ? COLORS.white
        : variant === 'secondary' ? COLORS.white
            : variant === 'outline' ? COLORS.primary
                : COLORS.text;

    const borderColor = variant === 'outline' ? COLORS.primary : 'transparent';

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isLoading}
            style={[
                styles.container,
                { backgroundColor: disabled ? COLORS.border : bgColor, borderColor },
                variant === 'outline' && styles.outline,
                animatedStyle
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <AppText variant="h3" color={disabled ? COLORS.textLight : textColor} style={styles.text}>
                    {title}
                </AppText>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        borderRadius: SIZES.radius.m,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: SPACING.l,
    },
    outline: {
        borderWidth: 2,
    },
    text: {
        marginBottom: 0, // Reset default mb from h3
    }
});
