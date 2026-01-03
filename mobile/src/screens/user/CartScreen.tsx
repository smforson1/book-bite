import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useCartStore } from '../../store/useCartStore';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import CustomHeader from '../../components/navigation/CustomHeader';

export default function CartScreen({ navigation }: any) {
    const { colors, spacing, sizes, shadows } = useTheme();
    const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
    const total = getTotalPrice();

    const handleCheckout = (item: any) => {
        const partialBusiness = {
            id: item.businessId,
            name: item.businessName,
        };

        if (item.type === 'ROOM') {
            const room = {
                id: item.id,
                name: item.name,
                price: item.price,
            };
            navigation.navigate('BookingCheckout', { room, business: partialBusiness });
        } else {
            navigation.navigate('OrderCheckout', {
                cart: [item],
                business: partialBusiness
            });
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <AppCard style={styles.card}>
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <AppText variant="h3">{item.name}</AppText>
                    <AppText variant="caption" color={colors.textLight}>
                        {item.businessName}
                    </AppText>
                    <AppText variant="body" color={colors.primary} bold>
                        GH₵{item.price} x {item.quantity}
                    </AppText>
                </View>
                <IconButton
                    icon="delete-outline"
                    iconColor={colors.error}
                    onPress={() => removeItem(item.id)}
                />
            </View>

            <View style={styles.actionRow}>
                <AppButton
                    title="Checkout"
                    variant="primary"
                    onPress={() => handleCheckout(item)}
                    style={{ marginTop: spacing.xs, paddingHorizontal: 10, paddingVertical: 4 }}
                />
            </View>
        </AppCard>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader
                title="Your Cart"
                rightAction={
                    items.length > 0 && (
                        <IconButton icon="trash-can-outline" iconColor={colors.error} onPress={clearCart} />
                    )
                }
            />

            <View style={[styles.content, { padding: spacing.m }]}>
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconButton icon="cart-off" size={64} iconColor={colors.border} />
                            <AppText variant="body" color={colors.textLight} center>
                                Your cart is empty.
                            </AppText>
                            <AppButton
                                title="Start Browsing"
                                variant="outline"
                                style={{ marginTop: spacing.m }}
                                onPress={() => navigation.navigate('Places')}
                            />
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                {items.length > 0 && (
                    <View style={[styles.footerInfo, { backgroundColor: colors.surface, borderRadius: sizes.radius.l, ...shadows.medium }]}>
                        <AppText variant="caption" color={colors.textLight} center>
                            Checkout each item individually above.
                        </AppText>
                        <View style={styles.totalRow}>
                            <AppText variant="h3">Total Value: </AppText>
                            <AppText variant="h2" color={colors.primary}>GH₵{total}</AppText>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    card: { marginBottom: 16 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    actionRow: { marginTop: 8, alignItems: 'flex-end' },
    empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    footerInfo: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        padding: 16,
        alignItems: 'center'
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    }
});
