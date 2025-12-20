import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { COLORS, SIZES, SPACING } from '../../theme';
import AppText from '../ui/AppText';

interface CustomHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export default function CustomHeader({ title, showBack = false, rightAction }: CustomHeaderProps) {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    />
                )}
                <AppText variant="h2" style={styles.title}>{title}</AppText>
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
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.xl * 1.5, // Status bar padding approx
        paddingBottom: SPACING.m,
        backgroundColor: COLORS.background,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginLeft: -10,
        marginRight: SPACING.s,
    },
    title: {
        color: COLORS.text,
        marginBottom: 0,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
