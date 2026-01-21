import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface AppCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    noPadding?: boolean;
}

export default function AppCard({ children, style, onPress, noPadding = false }: AppCardProps) {
    const { colors, sizes, shadows, spacing } = useTheme();

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
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    containerStyle as any,
                    { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
                ]}
            >
                {children}
            </Pressable>
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
        width: '100%',
    },
});
