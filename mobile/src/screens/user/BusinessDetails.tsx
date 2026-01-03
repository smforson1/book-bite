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
const CARD_WIDTH = SCREEN_WIDTH - 40;

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
    const { items: cartItems, addItem } = useCartStore();

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
            <Card key={room.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                {room.images && (
                    <ImageCarousel
                        images={room.images}
                        height={180}
                        width={CARD_WIDTH}
                        borderRadius={8}
                    />
                )}
                <Card.Content>
                    <AppText variant="h3">{room.name}</AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
                        <Chip icon="account-group" compact textStyle={{ color: colors.text }}>{room.capacity} Pax</Chip>

                        {/* Inventory Display */}
                        {business.type === 'HOSTEL' ? (
                            <>
                                {(room.stockMale > 0 || (!room.stockMale && !room.stockFemale)) && (
                                    <Chip icon="gender-male" compact mode="outlined" textStyle={{ color: colors.text }}>
                                        {room.availableMale !== undefined ? room.availableMale : room.stockMale} Male Beds Left
                                    </Chip>
                                )}
                                {(room.stockFemale > 0) && (
                                    <Chip icon="gender-female" compact mode="outlined" textStyle={{ color: colors.text }}>
                                        {room.availableFemale !== undefined ? room.availableFemale : room.stockFemale} Female Beds Left
                                    </Chip>
                                )}
                            </>
                        ) : (
                            <Chip icon="door" compact textStyle={{ color: colors.text }}>
                                {room.availableStock !== undefined ? room.availableStock : room.totalStock} Rooms Left
                            </Chip>
                        )}
                    </View>

                    {utilities.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                            {utilities.map((u: string, idx: number) => (
                                <View key={idx} style={{ backgroundColor: colors.border + '50', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                    <View style={{ paddingHorizontal: 4 }}>
                                        <AppText variant="caption" color={colors.textLight}>{u}</AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <AppText variant="h3" style={[styles.price, { color: colors.primary }]}>
                        GH₵{room.price} / {business.type === 'HOSTEL' ? 'year' : 'night'}
                    </AppText>
                    <View style={styles.buttonRow}>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('BookingCheckout', { room, business })}
                            style={[styles.flexButton, { backgroundColor: colors.primary }]}
                        >
                            <AppText variant="button" color={colors.white}>Book Now</AppText>
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <ImageCarousel
                    images={business.images}
                    height={250}
                />
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <AppText variant="h1" style={styles.title}>
                            {business.name}
                        </AppText>
                        <AppText variant="body" color={colors.textLight} style={styles.address}>
                            {business.address}
                        </AppText>
                    </View>
                    <IconButton
                        icon="share-variant"
                        iconColor={colors.primary}
                        onPress={handleShare}
                    />
                </View>

                <AppText variant="body" style={styles.description}>
                    {business.description}
                </AppText>

                <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

                {isHotel ? (
                    <>
                        <AppText variant="h2" style={styles.sectionTitle}>
                            Available {business.type === 'HOTEL' ? 'Rooms' : 'Bed Spaces'}
                        </AppText>

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
                        <AppText variant="h2" style={styles.sectionTitle}>
                            Menu
                        </AppText>
                        {menu.map((category) => (
                            <View key={category.id}>
                                <View style={[styles.categoryTitle, { backgroundColor: colors.surface }]}>
                                    <AppText variant="h3" bold>{category.name}</AppText>
                                </View>
                                {category.items.map((item: any) => (
                                    <Card key={item.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                                        <Card.Content>
                                            <View style={styles.menuItemRow}>
                                                {item.images && (
                                                    <View style={{ marginBottom: 15 }}>
                                                        <ImageCarousel
                                                            images={item.images}
                                                            height={180}
                                                            width={CARD_WIDTH}
                                                            borderRadius={8}
                                                        />
                                                    </View>
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <AppText variant="h3">{item.name}</AppText>
                                                    <AppText variant="body" color={colors.textLight} numberOfLines={2}>{item.description}</AppText>
                                                    <AppText variant="h3" color={colors.primary} style={styles.price}>
                                                        GH₵{item.price}
                                                    </AppText>
                                                </View>
                                                <View style={styles.buttonRow}>
                                                    <Button
                                                        mode="contained"
                                                        onPress={() => navigation.navigate('OrderCheckout', { cart: [{ ...item, quantity: 1 }], business })}
                                                        style={[styles.flexButton, { backgroundColor: colors.primary }]}
                                                        compact
                                                    >
                                                        <AppText variant="button" color={colors.white}>Order Now</AppText>
                                                    </Button>
                                                    <Button
                                                        mode="outlined"
                                                        onPress={() => handleAddToCart(item)}
                                                        style={[styles.flexButton, { borderColor: colors.primary }]}
                                                        textColor={colors.primary}
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
                <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.reviewsHeader}>
                    <View>
                        <AppText variant="h2" style={styles.sectionTitle}>
                            Reviews
                        </AppText>
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
                    <AppText variant="body" color={colors.textLight} style={{ padding: 20, textAlign: 'center' }}>
                        No reviews yet. Be the first to review!
                    </AppText>
                )}

                {reviews.length > 3 && (
                    <Button
                        mode="text"
                        textColor={colors.primary}
                        onPress={() => {/* TODO: Navigate to all reviews screen */ }}
                    >
                        View All {reviews.length} Reviews
                    </Button>
                )}
            </ScrollView>

            {!isHotel && cartItems.length > 0 && (
                <View style={[styles.footer, { backgroundColor: colors.primary }]}>
                    <AppText variant="h3" color={colors.white}>
                        {cartItems.length} items • GH₵{cartItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0)}
                    </AppText>
                    <Button
                        mode="contained"
                        buttonColor={colors.white}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    title: { padding: 20, paddingBottom: 5 },
    address: { paddingHorizontal: 20 },
    description: { padding: 20, paddingTop: 10 },
    divider: { marginVertical: 10 },
    sectionTitle: { paddingHorizontal: 20, paddingVertical: 10 },
    categoryTitle: { paddingHorizontal: 20, paddingVertical: 12 },
    card: { marginHorizontal: 20, marginBottom: 15 },
    price: { fontWeight: 'bold', marginTop: 5 },
    bookBtn: { marginTop: 10 },
    menuItemRow: { flexDirection: 'column', alignItems: 'stretch' },
    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    flexButton: { flex: 1 },
    footer: {
        padding: 15,
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
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
});
