import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import ImageUpload from '../../components/ui/ImageUpload';

const API_URL = 'http://10.0.2.2:5000/api';

export default function AddMenuItem({ navigation }: any) {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    // New Category states
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);

    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors } = useTheme();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/menu-items/business/${business?.id}`);
            setCategories(response.data);
            if (response.data.length > 0 && !selectedCategory) {
                setSelectedCategory(response.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName || !business?.id) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        setIsAddingCategory(true);
        try {
            await axios.post(
                `${API_URL}/menu-items/categories`,
                { businessId: business?.id, name: newCategoryName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewCategoryName('');
            setShowAddCategory(false);
            fetchCategories();
            Alert.alert('Success', 'Category created!');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create category');
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleAiGenerate = async () => {
        if (!name) {
            Alert.alert('Inspiration Needed', 'Please enter an item name first so I know what to write about! ✨');
            return;
        }

        setAiLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/ai/generate-content`,
                { type: 'menu', name, details: description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDescription(response.data.description);
        } catch (error) {
            console.error('AI Gen Error:', error);
            Alert.alert('Oops', 'The AI is taking a coffee break. Please try again or write it yourself!');
        } finally {
            setAiLoading(false);
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
                    images: [imageUrl || 'DEFAULT'],
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
                    Add Menu Item
                </Text>

                {categories.length === 0 && !showAddCategory ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.textLight }]}>No categories yet. Create one first!</Text>
                        <Button
                            mode="contained"
                            onPress={() => setShowAddCategory(true)}
                            style={styles.button}
                            buttonColor={colors.primary}
                            textColor={colors.white}
                        >
                            Create Category
                        </Button>
                    </View>
                ) : (
                    <>
                        {!showAddCategory ? (
                            <View style={{ marginBottom: 20 }}>
                                <Text variant="titleMedium" style={[styles.label, { color: colors.text }]}>
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
                                    theme={{ colors: { secondaryContainer: colors.primaryLight, onSecondaryContainer: colors.text, outline: colors.primary } }}
                                />
                                <Button
                                    mode="text"
                                    onPress={() => setShowAddCategory(true)}
                                    style={styles.addCategoryBtn}
                                    textColor={colors.primary}
                                >
                                    + Add New Category
                                </Button>
                            </View>
                        ) : (
                            <View style={styles.addCategoryContainer}>
                                <Text variant="titleMedium" style={[styles.label, { color: colors.text }]}>
                                    New Category Name
                                </Text>
                                <View style={styles.inlineRow}>
                                    <TextInput
                                        value={newCategoryName}
                                        onChangeText={setNewCategoryName}
                                        style={styles.inlineInput}
                                        placeholder="e.g., Breakfast"
                                        mode="outlined"
                                        activeOutlineColor={colors.primary}
                                        outlineColor={colors.primary}
                                    />
                                    <Button
                                        mode="contained"
                                        onPress={handleAddCategory}
                                        loading={isAddingCategory}
                                        disabled={isAddingCategory}
                                        style={styles.inlineButton}
                                        buttonColor={colors.primary}
                                    >
                                        Add
                                    </Button>
                                </View>
                                <Button
                                    mode="text"
                                    onPress={() => setShowAddCategory(false)}
                                    textColor={colors.error}
                                >
                                    Cancel
                                </Button>
                            </View>
                        )}

                        <TextInput
                            label="Item Name *"
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
                                numberOfLines={3}
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
                            label="Menu Item Photo"
                            onImageUploaded={(url: string) => setImageUrl(url)}
                            initialImage={imageUrl}
                        />

                        <TextInput
                            label="Price *"
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

                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={loading || showAddCategory}
                            style={styles.button}
                            buttonColor={colors.primary}
                            textColor={colors.white}
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
    container: { flex: 1 },
    content: { padding: 20 },
    title: { marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    label: { marginBottom: 10, marginTop: 10 },
    segment: { marginBottom: 10 },
    addCategoryBtn: { alignSelf: 'flex-start' },
    input: { marginBottom: 15 },
    button: { marginTop: 20, paddingVertical: 5 },
    emptyState: { marginTop: 50, alignItems: 'center' },
    emptyText: { marginBottom: 20, textAlign: 'center' },
    addCategoryContainer: { marginBottom: 20, padding: 15, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.02)' },
    inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    inlineInput: { flex: 1, height: 50 },
    inlineButton: { height: 50, justifyContent: 'center' },
    magicBtn: { position: 'absolute', right: 5, top: 5, zIndex: 1 },
});
