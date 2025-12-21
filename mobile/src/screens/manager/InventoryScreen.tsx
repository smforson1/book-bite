import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import AppText from '../../components/ui/AppText';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

interface Room {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

interface MenuItem {
    id: string;
    name: string;
    price: number;
    stock: number;
    isAvailable: boolean;
    category: { name: string };
}

export default function InventoryScreen() {
    const { token } = useAuthStore();
    const { colors, spacing, shadows } = useTheme();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await axios.get(`${API_URL}/inventory/business`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRooms(response.data.rooms || []);
            setMenuItems(response.data.menuItems || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            Alert.alert('Error', 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const toggleRoomAvailability = async (roomId: string, currentStatus: boolean) => {
        try {
            await axios.put(
                `${API_URL}/inventory/room/${roomId}/availability`,
                { isAvailable: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRooms(rooms.map(r => r.id === roomId ? { ...r, isAvailable: !currentStatus } : r));
        } catch (error) {
            console.error('Error updating room:', error);
            Alert.alert('Error', 'Failed to update room availability');
        }
    };

    const updateMenuItemStock = async (itemId: string, newStock: number) => {
        if (newStock < 0) return;

        try {
            await axios.put(
                `${API_URL}/inventory/menu-item/${itemId}/stock`,
                { stock: newStock },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMenuItems(menuItems.map(item => item.id === itemId ? { ...item, stock: newStock } : item));
        } catch (error) {
            console.error('Error updating stock:', error);
            Alert.alert('Error', 'Failed to update stock');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <AppText>Loading inventory...</AppText>
            </View>
        );
    }

    // Dynamic Styles
    const cardStyle = {
        backgroundColor: colors.surface,
        shadowColor: shadows.medium.shadowColor,
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.section, { padding: spacing.m }]}>
                <AppText variant="h2" style={[styles.sectionTitle, { marginBottom: spacing.m }]}>Rooms</AppText>
                {rooms.length === 0 ? (
                    <AppText style={{ textAlign: 'center', color: colors.textLight, marginTop: spacing.l }}>No rooms found</AppText>
                ) : (
                    rooms.map(room => (
                        <View key={room.id} style={[styles.card, cardStyle, { padding: spacing.m, marginBottom: spacing.s }]}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <AppText variant="h3">{room.name}</AppText>
                                    <AppText style={{ color: colors.primary, marginTop: spacing.xs }}>GH₵{room.price.toString()}/night</AppText>
                                </View>
                                <View style={styles.switchContainer}>
                                    <AppText style={{ fontSize: 12, color: colors.textLight, marginBottom: spacing.xs }}>Available</AppText>
                                    <Switch
                                        value={room.isAvailable}
                                        onValueChange={() => toggleRoomAvailability(room.id, room.isAvailable)}
                                        trackColor={{ false: '#ccc', true: colors.primary }}
                                        thumbColor={colors.white}
                                    />
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>

            <View style={[styles.section, { padding: spacing.m }]}>
                <AppText variant="h2" style={[styles.sectionTitle, { marginBottom: spacing.m }]}>Menu Items</AppText>
                {menuItems.length === 0 ? (
                    <AppText style={{ textAlign: 'center', color: colors.textLight, marginTop: spacing.l }}>No menu items found</AppText>
                ) : (
                    menuItems.map(item => (
                        <View key={item.id} style={[styles.card, cardStyle, { padding: spacing.m, marginBottom: spacing.s }]}>
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <AppText variant="h3">{item.name}</AppText>
                                    <AppText style={{ color: colors.textLight, fontSize: 12, marginTop: 2 }}>{item.category.name}</AppText>
                                    <AppText style={{ color: colors.primary, marginTop: spacing.xs }}>GH₵{item.price.toString()}</AppText>
                                </View>
                                <View style={styles.stockContainer}>
                                    <AppText style={{ fontSize: 12, color: colors.textLight, marginBottom: spacing.xs }}>Stock</AppText>
                                    <View style={[styles.stockControls, { gap: spacing.xs }]}>
                                        <TouchableOpacity
                                            style={[styles.stockButton, { backgroundColor: colors.primary }]}
                                            onPress={() => updateMenuItemStock(item.id, item.stock - 1)}
                                        >
                                            <AppText style={[styles.stockButtonText, { color: colors.white }]}>-</AppText>
                                        </TouchableOpacity>
                                        <TextInput
                                            style={styles.stockInput}
                                            value={item.stock.toString()}
                                            keyboardType="number-pad"
                                            onChangeText={(text) => {
                                                const num = parseInt(text) || 0;
                                                updateMenuItemStock(item.id, num);
                                            }}
                                        />
                                        <TouchableOpacity
                                            style={[styles.stockButton, { backgroundColor: colors.primary }]}
                                            onPress={() => updateMenuItemStock(item.id, item.stock + 1)}
                                        >
                                            <AppText style={[styles.stockButtonText, { color: colors.white }]}>+</AppText>
                                        </TouchableOpacity>
                                    </View>
                                    {item.stock === 0 && (
                                        <AppText style={{ fontSize: 10, color: colors.success, marginTop: 2 }}>Unlimited</AppText>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        // padding handled inline
    },
    sectionTitle: {
        // margin handled inline
    },
    card: {
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchContainer: {
        alignItems: 'center',
    },
    stockContainer: {
        alignItems: 'center',
    },
    stockControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stockButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    stockInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 50,
        textAlign: 'center',
        fontSize: 16,
    },
});
