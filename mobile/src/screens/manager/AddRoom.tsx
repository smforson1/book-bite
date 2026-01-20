import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, HelperText, Portal, Modal } from 'react-native-paper'; // added Chip, HelperText
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import ImageUpload from '../../components/ui/ImageUpload';

const API_URL = 'http://10.0.2.2:5000/api';

const UTILITIES_OPTIONS = [
    'Shared Kitchen', 'Private Kitchen',
    'Shared Bathroom', 'Private Bathroom',
    'Shared Meter', 'Self Meter',
    'Study Desk', 'Wardrobe',
    'Fan', 'AC'
];

export default function AddRoom({ navigation, route }: any) {
    const editRoom = route.params?.room; // Check if editing

    const [name, setName] = useState(editRoom?.name || '');
    const [description, setDescription] = useState(editRoom?.description || '');
    const [price, setPrice] = useState(editRoom?.price?.toString() || '');
    const [capacity, setCapacity] = useState(editRoom?.capacity?.toString() || '');
    const [totalStock, setTotalStock] = useState(editRoom?.totalStock?.toString() || '1');
    const [stockMale, setStockMale] = useState(editRoom?.stockMale?.toString() || '');
    const [stockFemale, setStockFemale] = useState(editRoom?.stockFemale?.toString() || '');

    // Category states
    const [categoryId, setCategoryId] = useState(editRoom?.categoryId || '');
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Parse existing amenities to find utilities
    const initialUtilities = editRoom?.amenities
        ? editRoom.amenities
            .filter((a: string) => a.startsWith('UTILITY:'))
            .map((a: string) => a.replace('UTILITY:', ''))
        : [];

    const [selectedUtilities, setSelectedUtilities] = useState<string[]>(initialUtilities);
    const [imageUrl, setImageUrl] = useState(editRoom?.images?.[0] !== 'DEFAULT' ? editRoom?.images?.[0] : '');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors } = useTheme();

    const isHostel = business?.type === 'HOSTEL';
    const isHotel = business?.type === 'HOTEL';

    useEffect(() => {
        if (isHotel && business?.id) {
            fetchCategories();
        }
    }, [isHotel, business]);

    const fetchCategories = async () => {
        if (!business?.id) return;
        try {
            const res = await axios.get(`${API_URL}/room-categories/business/${business.id}`);
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName || !business?.id) return;
        setIsAddingCategory(true);
        try {
            const res = await axios.post(`${API_URL}/room-categories`,
                { businessId: business.id, name: newCategoryName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCategories([...categories, res.data]);
            setCategoryId(res.data.id);
            setNewCategoryName('');
            Alert.alert('Success', 'Category added');
        } catch (error) {
            console.error('Failed to add category', error);
            Alert.alert('Error', 'Failed to add category');
        } finally {
            setIsAddingCategory(false);
        }
    };

    const toggleUtility = (utility: string) => {
        if (selectedUtilities.includes(utility)) {
            setSelectedUtilities(selectedUtilities.filter(u => u !== utility));
        } else {
            setSelectedUtilities([...selectedUtilities, utility]);
        }
    };

    const handleAiGenerate = async () => {
        if (!name) {
            Alert.alert('Inspiration Needed', 'Please enter a room name first so I know what to write about! ✨');
            return;
        }

        setAiLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/ai/generate-content`,
                { type: 'room', name, details: description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDescription(response.data.description);
        } catch (error) {
            console.error('AI Gen Error:', error);
            Alert.alert('Oops', 'The AI is taking a rest. Please try again later!');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!name || !price || !capacity) {
            Alert.alert('Error', 'Please fill in name, price, and capacity');
            return;
        }

        if (isHostel) {
            if (!stockMale && !stockFemale) {
                // Allow 0 if explicitly set, but warn if both empty strings
                if (stockMale === '' && stockFemale === '') {
                    Alert.alert('Error', 'Please enter at least one bed space count (Male or Female)');
                    return;
                }
            }
        } else {
            if (!totalStock) {
                Alert.alert('Error', 'Please enter total stock');
                return;
            }
        }

        setLoading(true);
        try {
            // Format utilities with prefix
            const amenities = selectedUtilities.map(u => `UTILITY:${u}`);

            const payload = {
                businessId: business?.id,
                categoryId: isHotel ? categoryId : null,
                name,
                description,
                price: parseFloat(price),
                capacity: parseInt(capacity),
                totalStock: isHostel ? (parseInt(stockMale || '0') + parseInt(stockFemale || '0')) : parseInt(totalStock),
                stockMale: isHostel ? parseInt(stockMale || '0') : 0,
                stockFemale: isHostel ? parseInt(stockFemale || '0') : 0,
                amenities: amenities,
                images: [imageUrl || 'DEFAULT'],
            };

            if (editRoom) {
                // Update
                await axios.put(`${API_URL}/rooms/${editRoom.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Alert.alert('Success', 'Room updated successfully!');
            } else {
                // Create
                await axios.post(`${API_URL}/rooms`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Alert.alert('Success', 'Room added successfully!');
            }

            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
                    {editRoom
                        ? (isHostel ? 'Edit Hostel Bed Space' : 'Edit Room')
                        : (isHostel ? 'Add Hostel Bed Space' : 'Add New Room')
                    }
                </Text>

                {isHotel && (
                    <View style={{ marginBottom: 20 }}>
                        <Text variant="titleMedium" style={{ marginBottom: 10 }}>Room Category (Optional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                            <Chip
                                selected={!categoryId}
                                onPress={() => setCategoryId('')}
                                style={styles.chip}
                            >
                                No Category
                            </Chip>
                            {categories.map((cat) => (
                                <Chip
                                    key={cat.id}
                                    selected={categoryId === cat.id}
                                    onPress={() => setCategoryId(cat.id)}
                                    style={styles.chip}
                                >
                                    {cat.name}
                                </Chip>
                            ))}
                        </ScrollView>

                        <View style={[styles.row, { alignItems: 'center', marginTop: 10 }]}>
                            <TextInput
                                label="Quick Add Category"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                style={{ flex: 1, height: 45 }}
                                mode="outlined"
                                activeOutlineColor={colors.primary}
                            />
                            <Button
                                mode="text"
                                onPress={handleAddCategory}
                                loading={isAddingCategory}
                                compact
                            >
                                Add
                            </Button>
                        </View>
                    </View>
                )}

                <TextInput
                    label={isHostel ? "Type Name (e.g. 4-in-a-room) *" : "Name (e.g. Deluxe Suite) *"}
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                    outlineColor={colors.primary}
                    activeOutlineColor={colors.primary}
                />

                <View style={{ position: 'relative' }}>
                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        outlineColor={colors.primary}
                        activeOutlineColor={colors.primary}
                    />
                    <Button
                        icon="auto-fix"
                        mode="text"
                        compact
                        onPress={handleAiGenerate}
                        loading={aiLoading}
                        style={styles.magicBtn}
                        textColor={colors.primary}
                    >
                        Magic✨
                    </Button>
                </View>

                <ImageUpload
                    label={isHostel ? "Room Photo" : "Photo"}
                    onImageUploaded={(url: string) => setImageUrl(url)}
                    initialImage={imageUrl}
                />

                <View style={styles.row}>
                    <TextInput
                        label={isHostel ? "Price / Year (GH₵) *" : "Price / Night (GH₵) *"}
                        value={price}
                        onChangeText={setPrice}
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        mode="outlined"
                        keyboardType="numeric"
                        activeOutlineColor={colors.primary}
                    />
                    <TextInput
                        label="Capacity (pax) *"
                        value={capacity}
                        onChangeText={setCapacity}
                        style={[styles.input, { flex: 1, marginLeft: 8 }]}
                        mode="outlined"
                        keyboardType="numeric"
                        activeOutlineColor={colors.primary}
                    />
                </View>

                {isHostel ? (
                    <View style={styles.row}>
                        <TextInput
                            label="Male Beds *"
                            value={stockMale}
                            onChangeText={setStockMale}
                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                            mode="outlined"
                            keyboardType="numeric"
                            placeholder="e.g. 20"
                            activeOutlineColor={colors.primary}
                        />
                        <TextInput
                            label="Female Beds *"
                            value={stockFemale}
                            onChangeText={setStockFemale}
                            style={[styles.input, { flex: 1, marginLeft: 8 }]}
                            mode="outlined"
                            keyboardType="numeric"
                            placeholder="e.g. 10"
                            activeOutlineColor={colors.primary}
                        />
                    </View>
                ) : (
                    <>
                        <TextInput
                            label="Total Rooms Available (Stock) *"
                            value={totalStock}
                            onChangeText={setTotalStock}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="numeric"
                            placeholder="e.g. 10"
                            activeOutlineColor={colors.primary}
                        />
                        <HelperText type="info">Total number of rooms of this specific type.</HelperText>
                    </>
                )}

                <Text variant="titleMedium" style={{ marginTop: 10, marginBottom: 10 }}>Utilities & Amenities</Text>
                <View style={styles.chipContainer}>
                    {UTILITIES_OPTIONS.map((utility) => (
                        <Chip
                            key={utility}
                            selected={selectedUtilities.includes(utility)}
                            onPress={() => toggleUtility(utility)}
                            style={styles.chip}
                            showSelectedOverlay
                        >
                            {utility}
                        </Chip>
                    ))}
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    buttonColor={colors.primary}
                    textColor={colors.white}
                >
                    {editRoom ? 'Update Room' : 'Add Room Type'}
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    title: { marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    input: { marginBottom: 15 },
    button: { marginTop: 20, paddingVertical: 5 },
    magicBtn: { position: 'absolute', right: 5, top: 5, zIndex: 1 },
    row: { flexDirection: 'row' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryContainer: { flexDirection: 'row', marginBottom: 5 },
    chip: { marginBottom: 4, marginRight: 8 }
});
