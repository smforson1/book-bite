import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Card, Divider, List, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function BusinessDetails({ route, navigation }: any) {
    const { id } = route.params;
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<any[]>([]);
    const [menu, setMenu] = useState<any[]>([]);
    // Cart state could be global, but for simple MVP local is okay or pass params
    // actually for order, we need to select items.
    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const bizRes = await axios.get(`${API_URL}/business/${id}`);
            setBusiness(bizRes.data);

            if (bizRes.data.type === 'HOTEL' || bizRes.data.type === 'HOSTEL') {
                const roomsRes = await axios.get(`${API_URL}/rooms/business/${id}`);
                setRooms(roomsRes.data);
            } else {
                const menuRes = await axios.get(`${API_URL}/menu-items/business/${id}`);
                setMenu(menuRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch details', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item: any) => {
        setCart([...cart, { ...item, quantity: 1 }]);
    };

    const removeFromCart = (itemId: string) => {
        setCart(cart.filter((i) => i.id !== itemId));
    };

    if (loading || !business) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const isHotel = business.type === 'HOTEL' || business.type === 'HOSTEL';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={{ uri: business.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop' }}
                    style={styles.image}
                />
                <Text variant="headlineMedium" style={styles.title}>
                    {business.name}
                </Text>
                <Text variant="bodyMedium" style={styles.address}>
                    {business.address}
                </Text>
                <Text variant="bodyMedium" style={styles.description}>
                    {business.description}
                </Text>

                <Divider style={styles.divider} />

                {isHotel ? (
                    <>
                        <Text variant="titleLarge" style={styles.sectionTitle}>
                            Available Rooms
                        </Text>
                        {rooms.map((room) => (
                            <Card key={room.id} style={styles.card}>
                                {room.images?.[0] && (
                                    <Card.Cover source={{ uri: room.images[0] }} style={styles.cardDetailImage} />
                                )}
                                <Card.Content>
                                    <Text variant="titleMedium">{room.name}</Text>
                                    <Text variant="bodyMedium">Capacity: {room.capacity} guests</Text>
                                    <Text variant="titleMedium" style={styles.price}>
                                        GH₵{room.price} / night
                                    </Text>
                                    <Button
                                        mode="contained"
                                        onPress={() => navigation.navigate('BookingCheckout', { room, business })}
                                        style={styles.bookBtn}
                                    >
                                        Book Now
                                    </Button>
                                </Card.Content>
                            </Card>
                        ))}
                    </>
                ) : (
                    <>
                        <Text variant="titleLarge" style={styles.sectionTitle}>
                            Menu
                        </Text>
                        {menu.map((category) => (
                            <View key={category.id}>
                                <Text variant="titleMedium" style={styles.categoryTitle}>
                                    {category.name}
                                </Text>
                                {category.items.map((item: any) => (
                                    <Card key={item.id} style={styles.card}>
                                        <Card.Content>
                                            <View style={styles.menuItemRow}>
                                                {item.images?.[0] && (
                                                    <Image source={{ uri: item.images[0] }} style={styles.menuThumb} />
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <Text variant="titleMedium">{item.name}</Text>
                                                    <Text variant="bodyMedium" numberOfLines={2}>{item.description}</Text>
                                                    <Text variant="titleSmall" style={styles.price}>
                                                        GH₵{item.price}
                                                    </Text>
                                                </View>
                                                {cart.find((c) => c.id === item.id) ? (
                                                    <Button mode="outlined" onPress={() => removeFromCart(item.id)} compact>
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button mode="contained" compact onPress={() => addToCart(item)}>
                                                        Add
                                                    </Button>
                                                )}
                                            </View>
                                        </Card.Content>
                                    </Card>
                                ))}
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>

            {!isHotel && cart.length > 0 && (
                <View style={styles.footer}>
                    <Text variant="titleMedium" style={{ color: '#fff' }}>
                        {cart.length} items • GH₵{cart.reduce((sum, i) => sum + Number(i.price), 0)}
                    </Text>
                    <Button
                        mode="contained"
                        buttonColor="#fff"
                        textColor="#000"
                        onPress={() => navigation.navigate('OrderCheckout', { cart, business })}
                    >
                        View Cart
                    </Button>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { paddingBottom: 80 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: 200 },
    title: { padding: 20, paddingBottom: 5, fontWeight: 'bold' },
    address: { paddingHorizontal: 20, color: '#666' },
    description: { padding: 20, paddingTop: 10 },
    divider: { marginVertical: 10 },
    sectionTitle: { padding: 20, fontWeight: 'bold' },
    categoryTitle: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f5f5f5' },
    card: { marginHorizontal: 20, marginBottom: 15 },
    price: { color: '#2e7d32', fontWeight: 'bold', marginTop: 5 },
    bookBtn: { marginTop: 10 },
    menuItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footer: {
        padding: 15,
        backgroundColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    cardDetailImage: { height: 150 },
    menuThumb: { width: 70, height: 70, borderRadius: 8, marginRight: 15 },
});
