import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import AppText from '../../components/ui/AppText';
import { COLORS } from '../../theme';

const SPACING = { xs: 4, s: 8, m: 12, l: 16, xl: 24 };
import { useAuthStore } from '../../store/useAuthStore';
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
            <View style={styles.container}>
                <AppText>Loading inventory...</AppText>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <AppText variant="h2" style={styles.sectionTitle}>Rooms</AppText>
                {rooms.length === 0 ? (
                    <AppText style={styles.emptyText}>No rooms found</AppText>
                ) : (
                    rooms.map(room => (
                        <View key={room.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <AppText variant="h3">{room.name}</AppText>
                                    <AppText style={styles.price}>GH₵{room.price.toString()}/night</AppText>
                                </View>
                                <View style={styles.switchContainer}>
                                    <AppText style={styles.label}>Available</AppText>
                                    <Switch
                                        value={room.isAvailable}
                                        onValueChange={() => toggleRoomAvailability(room.id, room.isAvailable)}
                                        trackColor={{ false: '#ccc', true: COLORS.primary }}
                                        thumbColor={COLORS.white}
                                    />
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>

            <View style={styles.section}>
                <AppText variant="h2" style={styles.sectionTitle}>Menu Items</AppText>
                {menuItems.length === 0 ? (
                    <AppText style={styles.emptyText}>No menu items found</AppText>
                ) : (
                    menuItems.map(item => (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <AppText variant="h3">{item.name}</AppText>
                                    <AppText style={styles.category}>{item.category.name}</AppText>
                                    <AppText style={styles.price}>GH₵{item.price.toString()}</AppText>
                                </View>
                                <View style={styles.stockContainer}>
                                    <AppText style={styles.label}>Stock</AppText>
                                    <View style={styles.stockControls}>
                                        <TouchableOpacity
                                            style={styles.stockButton}
                                            onPress={() => updateMenuItemStock(item.id, item.stock - 1)}
                                        >
                                            <AppText style={styles.stockButtonText}>-</AppText>
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
                                            style={styles.stockButton}
                                            onPress={() => updateMenuItemStock(item.id, item.stock + 1)}
                                        >
                                            <AppText style={styles.stockButtonText}>+</AppText>
                                        </TouchableOpacity>
                                    </View>
                                    {item.stock === 0 && (
                                        <AppText style={styles.unlimitedText}>Unlimited</AppText>
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
        backgroundColor: COLORS.background,
    },
    section: {
        padding: SPACING.m,
    },
    sectionTitle: {
        marginBottom: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.s,
        shadowColor: '#000',
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
    price: {
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },
    category: {
        color: COLORS.textLight,
        fontSize: 12,
        marginTop: 2,
    },
    switchContainer: {
        alignItems: 'center',
    },
    stockContainer: {
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: SPACING.xs,
    },
    stockControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    stockButton: {
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stockButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    stockInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.xs,
        minWidth: 50,
        textAlign: 'center',
        fontSize: 16,
    },
    unlimitedText: {
        fontSize: 10,
        color: COLORS.success,
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        marginTop: SPACING.l,
    },
});
