import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, HelperText } from 'react-native-paper'; // added Chip, HelperText
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

export default function AddRoom({ navigation }: any) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [capacity, setCapacity] = useState('');
    const [totalStock, setTotalStock] = useState('1'); // New State
    const [selectedUtilities, setSelectedUtilities] = useState<string[]>([]); // New State
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors } = useTheme();

    const toggleUtility = (utility: string) => {
        if (selectedUtilities.includes(utility)) {
            setSelectedUtilities(selectedUtilities.filter(u => u !== utility));
        } else {
            setSelectedUtilities([...selectedUtilities, utility]);
        }
    };

    const handleSubmit = async () => {
        if (!name || !price || !capacity || !totalStock) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // Format utilities with prefix
            const amenities = selectedUtilities.map(u => `UTILITY:${u}`);

            await axios.post(
                `${API_URL}/rooms`,
                {
                    businessId: business?.id,
                    name,
                    description,
                    price: parseFloat(price),
                    capacity: parseInt(capacity),
                    totalStock: parseInt(totalStock),
                    amenities: amenities,
                    images: [imageUrl || 'DEFAULT'],
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Alert.alert('Success', 'Room/Hostel type added successfully!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
                    Add New Room / Hostel Type
                </Text>

                <TextInput
                    label="Name (e.g. 2-in-a-room) *"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                    outlineColor={colors.primary}
                    activeOutlineColor={colors.primary}
                />

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

                <ImageUpload
                    label="Room Photo"
                    onImageUploaded={(url: string) => setImageUrl(url)}
                    initialImage={imageUrl}
                />

                <View style={styles.row}>
                    <TextInput
                        label="Price (GH₵) *"
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
                    Add Room Type
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
    row: { flexDirection: 'row' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { marginBottom: 4 }
});
