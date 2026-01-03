import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Card, Divider, List, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SIZES } from '../../theme';
import ImageCarousel from '../../components/ui/ImageCarousel';
import { Dimensions, Share } from 'react-native';
import BusinessDetailsSkeleton from '../../components/skeletons/BusinessDetailsSkeleton';
import ReviewCard from '../../components/ui/ReviewCard';
import RatingStars from '../../components/ui/RatingStars';
import AppText from '../../components/ui/AppText';
import { IconButton } from 'react-native-paper';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // 20 margin on each side

const API_URL = 'http://10.0.2.2:5000/api';

export default function BusinessDetails({ route, navigation }: any) {
    const { id } = route.params;
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [menu, setMenu] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState(0);

    const { colors, spacing } = useTheme();

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
                const [roomsRes, catsRes] = await Promise.all([
                    axios.get(`${API_URL}/rooms/business/${id}`),
                    bizRes.data.type === 'HOTEL'
                        ? axios.get(`${API_URL}/room-categories/business/${id}`)
                        : Promise.resolve({ data: [] })
                ]);
                setRooms(roomsRes.data);
                setCategories(catsRes.data);
            } else {
                const menuRes = await axios.get(`${API_URL}/menu-items/business/${id}`);
                setMenu(menuRes.data);
            }

            // Fetch reviews
            const reviewsRes = await axios.get(`${API_URL}/reviews/business/${id}`);
            setReviews(reviewsRes.data.reviews || []);

            // Calculate average rating
            if (reviewsRes.data.reviews && reviewsRes.data.reviews.length > 0) {
                const avg = reviewsRes.data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsRes.data.reviews.length;
                setAverageRating(avg);
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
            type: isHotel ? 'ROOM' : 'MENU_ITEM',
        });
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${business.name} on Book Bite! ${business.description || ''}`,
                title: business.name,
            });
        } catch (error) {
            console.error('Share failed', error);
        }
    };

    if (loading || !business) {
        return <BusinessDetailsSkeleton />;
    }

    const renderRoomItem = (room: any) => {
        const utilities = room.amenities
            ? room.amenities.filter((a: string) => a.startsWith('UTILITY:')).map((a: string) => a.replace('UTILITY:', ''))
            : [];

        return (
            <Card key={room.id} style={styles.card}>
                {room.images && (
                    <ImageCarousel
                        images={room.images}
                        height={180}
                        width={CARD_WIDTH}
                        borderRadius={SIZES.radius.l}
                    />
                )}
                <Card.Content>
                    <Text variant="titleMedium">{room.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
                        <Chip icon="account-group" compact>{room.capacity} Pax</Chip>

                        {/* Inventory Display */}
                        {business.type === 'HOSTEL' ? (
                            <>
                                {(room.stockMale > 0 || (!room.stockMale && !room.stockFemale)) && (
                                    <Chip icon="gender-male" compact mode="outlined">
                                        {room.availableMale !== undefined ? room.availableMale : room.stockMale} Male Beds Left
                                    </Chip>
                                )}
                                {(room.stockFemale > 0) && (
                                    <Chip icon="gender-female" compact mode="outlined">
                                        {room.availableFemale !== undefined ? room.availableFemale : room.stockFemale} Female Beds Left
                                    </Chip>
                                )}
                            </>
                        ) : (
                            <Chip icon="door" compact>
                                {room.availableStock !== undefined ? room.availableStock : room.totalStock} Rooms Left
                            </Chip>
                        )}
                    </View>

                    {utilities.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                            {utilities.map((u: string, idx: number) => (
                                <View key={idx} style={{ backgroundColor: colors.border + '50', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                    <View style={{ paddingHorizontal: 4 }}>
                                        <Text variant="labelSmall" style={{ color: colors.textLight }}>{u}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text variant="titleMedium" style={[styles.price, { color: colors.primary }]}>
                        GH₵{room.price} / {business.type === 'HOSTEL' ? 'year' : 'night'}
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
                            style={[styles.flexButton, { borderColor: colors.primary }]}
                            textColor={colors.primary}
                        >
                            Add to Cart
                        </Button>
                    </View>
                </Card.Content>
            </Card>
        );
    };

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
                            Available {business.type === 'HOTEL' ? 'Rooms' : 'Bed Spaces'}
                        </Text>

                        {business.type === 'HOTEL' ? (
                            <>
                                {categories.map((category) => {
                                    const categoryRooms = rooms.filter(r => r.categoryId === category.id);
                                    if (categoryRooms.length === 0) return null;
                                    return (
                                        <List.Accordion
                                            key={category.id}
                                            title={category.name}
                                            left={props => <List.Icon {...props} icon="folder" color={colors.primary} />}
                                            style={{ backgroundColor: colors.surface, paddingHorizontal: 10 }}
                                            titleStyle={{ color: colors.text, fontWeight: 'bold' }}
                                        >
                                            {categoryRooms.map(room => renderRoomItem(room))}
                                        </List.Accordion>
                                    );
                                })}

                                {rooms.filter(r => !r.categoryId).length > 0 && (
                                    <List.Accordion
                                        title="Other Rooms"
                                        left={props => <List.Icon {...props} icon="folder-outline" color={colors.textLight} />}
                                        style={{ backgroundColor: colors.surface, paddingHorizontal: 10 }}
                                        titleStyle={{ color: colors.textLight }}
                                    >
                                        {rooms.filter(r => !r.categoryId).map(room => renderRoomItem(room))}
                                    </List.Accordion>
                                )}
                            </>
                        ) : (
                            rooms.map((room) => renderRoomItem(room))
                        )}
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

                {/* Reviews Section */}
                <Divider style={styles.divider} />

                <View style={styles.reviewsHeader}>
                    <View>
                        <Text variant="titleLarge" style={styles.sectionTitle}>
                            Reviews
                        </Text>
                        {reviews.length > 0 && (
                            <View style={styles.ratingRow}>
                                <RatingStars rating={Math.round(averageRating)} readonly size={18} />
                                <AppText variant="body" style={{ marginLeft: 8 }}>
                                    {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                </AppText>
                            </View>
                        )}
                    </View>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('AddReview', { businessId: business.id, businessName: business.name })}
                        buttonColor={colors.primary}
                        compact
                    >
                        Write Review
                    </Button>
                </View>

                {reviews.length > 0 ? (
                    reviews.slice(0, 3).map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))
                ) : (
                    <AppText variant="body" color={COLORS.textLight} style={{ padding: 20, textAlign: 'center' }}>
                        No reviews yet. Be the first to review!
                    </AppText>
                )}

                {reviews.length > 3 && (
                    <Button
                        mode="text"
                        textColor={COLORS.primary}
                        onPress={() => {/* TODO: Navigate to all reviews screen */ }}
                    >
                        View All {reviews.length} Reviews
                    </Button>
                )}
            </ScrollView>

            {!isHotel && cartItems.length > 0 && (
                <View style={[styles.footer, { backgroundColor: colors.primary }]}>
                    <Text variant="titleMedium" style={{ color: '#fff' }}>
                        {cartItems.length} items • GH₵{cartItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0)}
                    </Text>
                    <Button
                        mode="contained"
                        buttonColor="#fff"
                        textColor={colors.primary}
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
    container: { flex: 1 },
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
    price: { fontWeight: 'bold', marginTop: 5 },
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
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
});
