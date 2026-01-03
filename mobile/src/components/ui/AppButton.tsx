import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
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
    const { colors, sizes, spacing } = useTheme();
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

    const bgColor = variant === 'primary' ? colors.primary
        : variant === 'secondary' ? colors.secondary
            : variant === 'ghost' ? 'transparent'
                : 'transparent';

    const textColor = variant === 'primary' ? colors.white
        : variant === 'secondary' ? colors.white
            : variant === 'outline' ? colors.primary
                : colors.text;

    const borderColor = variant === 'outline' ? colors.primary : 'transparent';

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isLoading}
            style={[
                styles.container,
                {
                    backgroundColor: disabled ? colors.border : bgColor,
                    borderColor,
                    borderRadius: sizes.radius.m,
                    paddingHorizontal: spacing.l,
                },
                variant === 'outline' && styles.outline,
                animatedStyle
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <AppText variant="h3" color={disabled ? colors.textLight : textColor} style={styles.text}>
                    {title}
                </AppText>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    outline: {
        borderWidth: 2,
    },
    text: {
        marginBottom: 0, // Reset default mb from h3
    }
});
