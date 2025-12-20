import { useState, useEffect } from 'react';
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
    const [loading, setLoading] = useState(true);
    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors, spacing } = useTheme();

    useEffect(() => {
        if (business) {
            fetchRooms();
        }
    }, [business]);

    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${API_URL}/rooms/business/${business?.id}`);
            setRooms(response.data);
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.m }]}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
                    Rooms
                </Text>

                {loading ? (
                    <Text>Loading...</Text>
                ) : rooms.length === 0 ? (
                    <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                        <Card.Content>
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>No rooms yet. Add your first room!</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    rooms.map((room) => {
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
                                                GH₵{room.price}/night
                                            </Text>
                                            <Text variant="bodySmall" style={[styles.capacity, { color: colors.textLight }]}>
                                                Capacity: {room.capacity} guests
                                            </Text>
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
                    })
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
    title: { marginBottom: 20, fontWeight: 'bold' },
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
