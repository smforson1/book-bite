import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../ui/AppText';

interface CustomHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export default function CustomHeader({ title, showBack = false, rightAction }: CustomHeaderProps) {
    const navigation = useNavigation();
    const { colors, spacing } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingHorizontal: spacing.l, paddingTop: spacing.xl * 1.5, paddingBottom: spacing.m }]}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        iconColor={colors.text}
                    />
                )}
                <AppText variant="h2" style={[styles.title, { color: colors.text }]}>{title}</AppText>
            </View>
            {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginLeft: -10,
        marginRight: 8, // Using hardcoded small spacing as fallback or use spacing.s
    },
    title: {
        marginBottom: 0,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
