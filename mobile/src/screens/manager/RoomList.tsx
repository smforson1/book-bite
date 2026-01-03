import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, FAB, List, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function RoomList({ navigation }: any) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors, spacing } = useTheme();

    useFocusEffect(
        useCallback(() => {
            if (business) {
                fetchData();
            }
        }, [business])
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, categoriesRes] = await Promise.all([
                axios.get(`${API_URL}/rooms/business/${business?.id}`),
                business?.type === 'HOTEL'
                    ? axios.get(`${API_URL}/room-categories/business/${business.id}`)
                    : Promise.resolve({ data: [] })
            ]);
            setRooms(roomsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = fetchData; // maintain backward compatibility if needed internally

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Room', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/rooms/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        fetchRooms();
                    } catch (error: any) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to delete room');
                    }
                },
            },
        ]);
    };

    const renderRoomCard = (room: any) => {
        const imageSource =
            room.images && room.images.length > 0 && room.images[0] !== 'DEFAULT'
                ? { uri: room.images[0] }
                : { uri: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000' };

        return (
            <Card key={room.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                <Card.Cover source={imageSource} style={{ height: 150 }} />
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardInfo}>
                            <Text variant="titleMedium" style={{ color: colors.text, marginTop: 10 }}>
                                {room.name}
                            </Text>
                            <Text variant="bodyMedium" style={[styles.price, { color: colors.success }]}>
                                GH₵{room.price}/{business?.type === 'HOSTEL' ? 'year' : 'night'}
                            </Text>

                            {business?.type === 'HOSTEL' ? (
                                <View style={{ marginTop: 4 }}>
                                    <Text variant="bodySmall" style={{ color: colors.textLight }}>
                                        Capacity: {room.capacity} per room
                                    </Text>
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                                        <Text variant="bodySmall" style={{ fontWeight: 'bold', color: '#1976D2' }}>
                                            Male: {room.availableMale ?? room.stockMale} / {room.stockMale || 0} left
                                        </Text>
                                        <Text variant="bodySmall" style={{ fontWeight: 'bold', color: '#E91E63' }}>
                                            Female: {room.availableFemale ?? room.stockFemale} / {room.stockFemale || 0} left
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <Text variant="bodySmall" style={[styles.capacity, { color: colors.textLight }]}>
                                    Capacity: {room.capacity} guests • Available: {room.availableStock ?? room.totalStock} / {room.totalStock || 1}
                                </Text>
                            )}
                        </View>
                        <View style={styles.actions}>
                            <IconButton
                                icon="pencil"
                                size={20}
                                iconColor={colors.primary}
                                onPress={() => navigation.navigate('EditRoom', { room })}
                            />
                            <IconButton
                                icon="delete"
                                size={20}
                                iconColor={colors.error}
                                onPress={() => handleDelete(room.id)}
                            />
                        </View>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.m }]}>
                <View style={[styles.header, { marginBottom: spacing.l }]}>
                    <Text variant="headlineMedium" style={[styles.title, { color: colors.primary, marginBottom: 0 }]}>
                        Rooms
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <IconButton
                            icon="calendar-plus"
                            mode="contained-tonal"
                            containerColor={colors.primary + '15'}
                            iconColor={colors.primary}
                            size={24}
                            onPress={() => navigation.navigate('AddManualBooking')}
                        />
                        {business?.type === 'HOTEL' && (
                            <Button
                                mode="outlined"
                                onPress={() => Alert.alert('Coming Soon', 'Room Category management separate screen will be here. For now, you can add categories when adding/editing rooms.')}
                                style={{ borderRadius: 8 }}
                            >
                                Categories
                            </Button>
                        )}
                    </View>
                </View>

                {loading ? (
                    <Text>Loading...</Text>
                ) : rooms.length === 0 ? (
                    <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                        <Card.Content>
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>No rooms yet. Add your first room!</Text>
                        </Card.Content>
                    </Card>
                ) : business?.type === 'HOTEL' ? (
                    // Render Grouped by Category for Hotels
                    <>
                        {categories.map((category) => {
                            const categoryRooms = rooms.filter(r => r.categoryId === category.id);
                            if (categoryRooms.length === 0) return null;

                            return (
                                <List.Accordion
                                    key={category.id}
                                    title={category.name}
                                    left={props => <List.Icon {...props} icon="folder" color={colors.primary} />}
                                    style={{ backgroundColor: colors.surface, marginBottom: 8, borderRadius: 8 }}
                                    titleStyle={{ color: colors.text, fontWeight: 'bold' }}
                                >
                                    {categoryRooms.map(room => renderRoomCard(room))}
                                </List.Accordion>
                            );
                        })}

                        {/* Uncategorized Rooms */}
                        {rooms.filter(r => !r.categoryId).length > 0 && (
                            <List.Accordion
                                title="Uncategorized"
                                left={props => <List.Icon {...props} icon="folder-outline" color={colors.textLight} />}
                                style={{ backgroundColor: colors.surface, marginBottom: 8, borderRadius: 8 }}
                                titleStyle={{ color: colors.textLight }}
                            >
                                {rooms.filter(r => !r.categoryId).map(room => renderRoomCard(room))}
                            </List.Accordion>
                        )}
                    </>
                ) : (
                    // Flat list for Hostels/Others
                    rooms.map((room) => renderRoomCard(room))
                )}
            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: colors.primary }]}
                color={colors.white}
                onPress={() => navigation.navigate('AddRoom')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 120 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontWeight: 'bold' },
    card: { marginBottom: 15 },
    emptyCard: { marginTop: 50 },
    emptyText: { textAlign: 'center' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    cardInfo: { flex: 1 },
    price: { fontWeight: 'bold', marginTop: 5 },
    capacity: { marginTop: 3 },
    actions: { flexDirection: 'row' },
    fab: { position: 'absolute', right: 16, bottom: 100 },
});
