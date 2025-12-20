import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface AppTextProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    color?: string;
    bold?: boolean;
    center?: boolean;
}

export default function AppText({
    children,
    style,
    variant = 'body',
    color,
    bold = false,
    center = false,
    ...props
}: AppTextProps) {
    const { colors, fonts } = useTheme();
    const finalColor = color || (variant === 'caption' ? colors.textLight : colors.text);

    return (
        <Text
            style={[
                { fontFamily: fonts.regular },
                variant !== 'body' && styles[variant],
                { color: finalColor },
                bold && { fontWeight: '700', fontFamily: fonts.bold },
                center && styles.center,
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    center: {
        textAlign: 'center',
    },
    h1: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 6,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    caption: {
        fontSize: 12,
        lineHeight: 16,
    },
});
