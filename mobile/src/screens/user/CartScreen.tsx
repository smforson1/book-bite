import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useCartStore } from '../../store/useCartStore';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../theme';
import AppText from '../../components/ui/AppText';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import CustomHeader from '../../components/navigation/CustomHeader';

export default function CartScreen({ navigation }: any) {
    const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
    const total = getTotalPrice();

    const renderItem = ({ item }: { item: any }) => (
        <AppCard style={styles.card}>
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <AppText variant="h3">{item.name}</AppText>
                    <AppText variant="caption" color={COLORS.textLight}>
                        {item.businessName}
                    </AppText>
                    <AppText variant="body" color={COLORS.primary} bold>
                        GH₵{item.price} x {item.quantity}
                    </AppText>
                </View>
                <IconButton
                    icon="delete-outline"
                    iconColor={COLORS.error}
                    onPress={() => removeItem(item.id)}
                />
            </View>
        </AppCard>
    );

    return (
        <View style={styles.container}>
            <CustomHeader
                title="Your Cart"
                rightAction={
                    items.length > 0 && (
                        <IconButton icon="trash-can-outline" iconColor={COLORS.error} onPress={clearCart} />
                    )
                }
            />

            <View style={styles.content}>
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <IconButton icon="cart-off" size={64} iconColor={COLORS.border} />
                            <AppText variant="body" color={COLORS.textLight} center>
                                Your cart is empty.
                            </AppText>
                            <AppButton
                                title="Start Browsing"
                                variant="outline"
                                style={{ marginTop: SPACING.m }}
                                onPress={() => navigation.navigate('Places')}
                            />
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />

                {items.length > 0 && (
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <AppText variant="h3">Total</AppText>
                            <AppText variant="h2" color={COLORS.primary}>GH₵{total}</AppText>
                        </View>
                        <AppButton
                            title="Checkout"
                            onPress={() => {
                                if (items.length > 0) {
                                    // Groups items by business for single checkout or just pass all
                                    // For now, checkout handles one business at a time usually, 
                                    // but we can pass the whole cart.
                                    navigation.navigate('OrderCheckout', {
                                        cart: items,
                                        business: { id: items[0].businessId, name: items[0].businessName }
                                    });
                                }
                            }}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, padding: SPACING.m },
    card: { marginBottom: SPACING.m },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    footer: {
        position: 'absolute',
        bottom: 100, // Lifted to clear CustomTabBar (85px)
        left: SPACING.m,
        right: SPACING.m,
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: SIZES.radius.l,
        ...SHADOWS.medium,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
});
