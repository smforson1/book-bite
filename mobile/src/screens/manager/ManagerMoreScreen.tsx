import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';

export default function ManagerMoreScreen({ navigation }: any) {
    const { colors, spacing } = useTheme();

    const menuItems = [
        {
            title: 'Inventory Management',
            description: 'Manage rooms or menu items stock',
            icon: 'clipboard-list-outline',
            screen: 'Inventory',
        },
        {
            title: 'Business Analytics',
            description: 'Revenue and performance stats',
            icon: 'chart-bar',
            screen: 'Analytics',
        },
        {
            title: 'My Wallet',
            description: 'Check balance and transactions',
            icon: 'wallet-outline',
            screen: 'Wallet',
        },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={{ padding: spacing.m }}>
                <AppText variant="h2" style={{ marginBottom: spacing.m }}>More Options</AppText>
            </View>

            <View style={{ backgroundColor: colors.surface }}>
                {menuItems.map((item, index) => (
                    <React.Fragment key={item.title}>
                        <List.Item
                            title={item.title}
                            description={item.description}
                            left={(props) => <List.Icon {...props} icon={item.icon} color={colors.primary} />}
                            right={(props) => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate(item.screen)}
                            titleStyle={{ fontWeight: 'bold' }}
                        />
                        {index < menuItems.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
