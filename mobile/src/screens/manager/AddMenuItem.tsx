import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function AddMenuItem({ navigation }: any) {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/menu-items/business/${business?.id}`);
            setCategories(response.data);
            if (response.data.length > 0) {
                setSelectedCategory(response.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const createCategory = async () => {
        const categoryName = prompt('Enter category name:');
        if (!categoryName) return;

        try {
            await axios.post(
                `${API_URL}/menu-items/categories`,
                { businessId: business?.id, name: categoryName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCategories();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create category');
        }
    };

    const handleSubmit = async () => {
        if (!name || !price || !selectedCategory) {
            Alert.alert('Error', 'Please fill in all required fields and select a category');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${API_URL}/menu-items`,
                {
                    categoryId: selectedCategory,
                    name,
                    description,
                    price: parseFloat(price),
                    images: [],
                    dietaryTags: [],
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Success', 'Menu item added successfully!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add menu item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Add Menu Item
                </Text>

                {categories.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No categories yet. Create one first!</Text>
                        <Button mode="contained" onPress={createCategory} style={styles.button}>
                            Create Category
                        </Button>
                    </View>
                ) : (
                    <>
                        <Text variant="titleMedium" style={styles.label}>
                            Category
                        </Text>
                        <SegmentedButtons
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                            buttons={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name,
                            }))}
                            style={styles.segment}
                        />
                        <Button mode="text" onPress={createCategory} style={styles.addCategoryBtn}>
                            + Add New Category
                        </Button>

                        <TextInput
                            label="Item Name *"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            mode="outlined"
                        />

                        <TextInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            style={styles.input}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                        />

                        <TextInput
                            label="Price *"
                            value={price}
                            onChangeText={setPrice}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="numeric"
                        />

                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        >
                            Add Menu Item
                        </Button>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    title: { marginBottom: 20, textAlign: 'center' },
    label: { marginBottom: 10, marginTop: 10 },
    segment: { marginBottom: 10 },
    addCategoryBtn: { marginBottom: 15 },
    input: { marginBottom: 15 },
    button: { marginTop: 20, paddingVertical: 5 },
    emptyState: { marginTop: 50, alignItems: 'center' },
    emptyText: { marginBottom: 20, textAlign: 'center', color: '#666' },
});
