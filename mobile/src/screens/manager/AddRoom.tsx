import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import ImageUpload from '../../components/ui/ImageUpload';

const API_URL = 'http://10.0.2.2:5000/api';

export default function AddRoom({ navigation }: any) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [capacity, setCapacity] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors } = useTheme();

    const handleSubmit = async () => {
        if (!name || !price || !capacity) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${API_URL}/rooms`,
                {
                    businessId: business?.id,
                    name,
                    description,
                    price: parseFloat(price),
                    capacity: parseInt(capacity),
                    amenities: [],
                    images: [imageUrl || 'DEFAULT'],
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Alert.alert('Success', 'Room added successfully!');
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
                    Add New Room
                </Text>

                <TextInput
                    label="Room Name *"
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

                <TextInput
                    label="Price per Night *"
                    value={price}
                    onChangeText={setPrice}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                    left={<TextInput.Affix text="GH₵" />}
                    activeOutlineColor={colors.primary}
                    outlineStyle={{ borderRadius: 10 }}
                    contentStyle={{ backgroundColor: colors.surface }}
                />

                <TextInput
                    label="Capacity (guests) *"
                    value={capacity}
                    onChangeText={setCapacity}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                    outlineColor={colors.primary}
                    activeOutlineColor={colors.primary}
                />

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    buttonColor={colors.primary}
                    textColor={colors.white}
                >
                    Add Room
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
});
