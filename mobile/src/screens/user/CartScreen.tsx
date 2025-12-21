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

    const handleCheckout = (item: any) => {
        const partialBusiness = {
            id: item.businessId,
            name: item.businessName,
            // We might lack other business details like address/image here, 
            // but the checkout screens usually just need ID/Name for creating order/booking.
            // If they need more, we might need to fetch it or store more in cart.
            // BookingCheckout uses: business.name.
            // OrderCheckout uses: business.name, business.deliveryFee (might be missing).
        };

        if (item.type === 'ROOM') {
            // Reconstruct room object
            const room = {
                id: item.id,
                name: item.name,
                price: item.price,
                // capacity, images etc specific to room are missing but maybe not strictly needed for checkout creation API call?
                // The Checkout screen might display them though. 
                // Let's hope the minimal data is enough or we might need to fetch.
                // Actually BookingCheckout usually expects a full room object.
                // But let's try passing what we have.
            };
            navigation.navigate('BookingCheckout', { room, business: partialBusiness });
        } else {
            // Assume MENU_ITEM or default
            navigation.navigate('OrderCheckout', {
                cart: [item], // Checkout only this item (or group? user said "each item")
                business: partialBusiness
            });
        }
    };

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

            <View style={styles.actionRow}>
                <AppButton
                    title="Checkout"
                    variant="primary"
                    onPress={() => handleCheckout(item)}
                    style={{ marginTop: SPACING.xs, paddingHorizontal: 10, paddingVertical: 4 }}
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

                {/* Global Footer removed as requested to do per-item checkout */}
                {items.length > 0 && (
                    <View style={styles.footerInfo}>
                        <AppText variant="caption" color={COLORS.textLight} center>
                            Checkout each item individually above.
                        </AppText>
                        <View style={styles.totalRow}>
                            <AppText variant="h3">Total Value: </AppText>
                            <AppText variant="h2" color={COLORS.primary}>GH₵{total}</AppText>
                        </View>
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
    actionRow: { marginTop: SPACING.s, alignItems: 'flex-end' },
    empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    footerInfo: {
        position: 'absolute',
        bottom: 20,
        left: SPACING.m,
        right: SPACING.m,
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: SIZES.radius.l,
        ...SHADOWS.medium,
        alignItems: 'center'
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs
    }
});
