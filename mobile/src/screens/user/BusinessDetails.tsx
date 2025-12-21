import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Card, Divider, List, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { COLORS, SIZES } from '../../theme';
import ImageCarousel from '../../components/ui/ImageCarousel';
import { Dimensions } from 'react-native';
import BusinessDetailsSkeleton from '../../components/skeletons/BusinessDetailsSkeleton';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // 20 margin on each side

const API_URL = 'http://10.0.2.2:5000/api';

export default function BusinessDetails({ route, navigation }: any) {
    const { id } = route.params;
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<any[]>([]);
    const [menu, setMenu] = useState<any[]>([]);

    // Global Cart Store
    const { items: cartItems, addItem, removeItem } = useCartStore();

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

    const handleAddToCart = (item: any) => {
        addItem({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            businessId: business.id,
            businessName: business.name,
        });
    };

    if (loading || !business) {
        return <BusinessDetailsSkeleton />;
    }

    const isHotel = business.type === 'HOTEL' || business.type === 'HOSTEL';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ImageCarousel
                    images={business.images}
                    height={250}
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
                                {room.images && (
                                    <ImageCarousel
                                        images={room.images}
                                        height={180}
                                        width={CARD_WIDTH}
                                        borderRadius={SIZES.radius.l} // Need to import SIZES or just use 12
                                    />
                                )}
                                <Card.Content>
                                    <Text variant="titleMedium">{room.name}</Text>
                                    <Text variant="bodyMedium">Capacity: {room.capacity} guests</Text>
                                    <Text variant="titleMedium" style={styles.price}>
                                        GH₵{room.price} / night
                                    </Text>
                                    <View style={styles.buttonRow}>
                                        <Button
                                            mode="contained"
                                            onPress={() => navigation.navigate('BookingCheckout', { room, business })}
                                            style={[styles.flexButton, { backgroundColor: COLORS.primary }]}
                                        >
                                            Book Now
                                        </Button>
                                        <Button
                                            mode="outlined"
                                            onPress={() => handleAddToCart(room)}
                                            style={[styles.flexButton, { borderColor: COLORS.primary }]}
                                            textColor={COLORS.primary}
                                        >
                                            Add to Cart
                                        </Button>
                                    </View>
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
                                                {item.images && (
                                                    <ImageCarousel
                                                        images={item.images}
                                                        height={180}
                                                        width={CARD_WIDTH}
                                                        borderRadius={8}
                                                    />
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <Text variant="titleMedium">{item.name}</Text>
                                                    <Text variant="bodyMedium" numberOfLines={2}>{item.description}</Text>
                                                    <Text variant="titleSmall" style={styles.price}>
                                                        GH₵{item.price}
                                                    </Text>
                                                </View>
                                                <View style={styles.buttonRow}>
                                                    <Button
                                                        mode="contained"
                                                        onPress={() => navigation.navigate('OrderCheckout', { cart: [{ ...item, quantity: 1 }], business })}
                                                        style={[styles.flexButton, { backgroundColor: COLORS.primary }]}
                                                        compact
                                                    >
                                                        Order Now
                                                    </Button>
                                                    <Button
                                                        mode="outlined"
                                                        onPress={() => handleAddToCart(item)}
                                                        style={[styles.flexButton, { borderColor: COLORS.primary }]}
                                                        textColor={COLORS.primary}
                                                        compact
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                ))}
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>

            {!isHotel && cartItems.length > 0 && (
                <View style={[styles.footer, { backgroundColor: COLORS.primary }]}>
                    <Text variant="titleMedium" style={{ color: '#fff' }}>
                        {cartItems.length} items • GH₵{cartItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0)}
                    </Text>
                    <Button
                        mode="contained"
                        buttonColor="#fff"
                        textColor={COLORS.primary}
                        onPress={() => navigation.navigate('OrderCheckout', { cart: cartItems, business })}
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
    price: { color: '#E65100', fontWeight: 'bold', marginTop: 5 },
    bookBtn: { marginTop: 10 },
    menuItemRow: { flexDirection: 'column', alignItems: 'stretch' },
    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    flexButton: { flex: 1 },
    footer: {
        padding: 15,
        backgroundColor: '#E65100',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    cardDetailImage: { height: 150 },
    menuThumb: { width: '100%', height: 150, borderRadius: 8, marginBottom: 10 },
});
