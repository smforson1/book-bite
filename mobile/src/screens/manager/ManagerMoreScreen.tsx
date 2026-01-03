import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { useBusinessStore } from '../../store/useBusinessStore';
import CustomHeader from '../../components/navigation/CustomHeader';

export default function ManagerMoreScreen({ navigation }: any) {
    const { colors } = useTheme();

    const business = useBusinessStore((state) => state.business);
    const isRestaurant = business?.type === 'RESTAURANT';

    const menuItems = [
        {
            title: 'My Profile',
            description: 'Manage your account details',
            icon: 'account-circle-outline',
            screen: 'Profile',
        },
        {
            title: 'Inventory Management',
            description: isRestaurant ? 'Manage menu items stock' : 'Manage room categories',
            icon: 'clipboard-list-outline',
            screen: 'Inventory',
        },
        ...(!isRestaurant ? [{
            title: 'Record Walk-in',
            description: 'Manual booking for non-app users',
            icon: 'calendar-plus',
            screen: 'AddManualBooking',
        }] : []),
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="More Options" />

            <ScrollView style={styles.container}>
                <View style={{ backgroundColor: colors.surface, marginTop: 10 }}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
