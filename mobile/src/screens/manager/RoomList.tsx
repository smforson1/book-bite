import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, FAB, List, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function RoomList({ navigation }: any) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);

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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Rooms
                </Text>

                {loading ? (
                    <Text>Loading...</Text>
                ) : rooms.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Text style={styles.emptyText}>No rooms yet. Add your first room!</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    rooms.map((room) => (
                        <Card key={room.id} style={styles.card}>
                            <Card.Content>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardInfo}>
                                        <Text variant="titleMedium">{room.name}</Text>
                                        <Text variant="bodyMedium" style={styles.price}>
                                            ${room.price}/night
                                        </Text>
                                        <Text variant="bodySmall" style={styles.capacity}>
                                            Capacity: {room.capacity} guests
                                        </Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <IconButton
                                            icon="pencil"
                                            size={20}
                                            onPress={() => navigation.navigate('EditRoom', { room })}
                                        />
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            iconColor="#d32f2f"
                                            onPress={() => handleDelete(room.id)}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('AddRoom')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 20, paddingBottom: 80 },
    title: { marginBottom: 20, fontWeight: 'bold' },
    card: { marginBottom: 15 },
    emptyCard: { marginTop: 50 },
    emptyText: { textAlign: 'center', color: '#666' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    cardInfo: { flex: 1 },
    price: { color: '#2e7d32', fontWeight: 'bold', marginTop: 5 },
    capacity: { color: '#666', marginTop: 3 },
    actions: { flexDirection: 'row' },
    fab: { position: 'absolute', right: 16, bottom: 16 },
});
