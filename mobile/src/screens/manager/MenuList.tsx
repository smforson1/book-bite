import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, FAB, List, IconButton, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function MenuList({ navigation }: any) {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const token = useAuthStore((state) => state.token);
    const business = useBusinessStore((state) => state.business);
    const { colors, spacing } = useTheme();

    useEffect(() => {
        if (business) {
            fetchMenu();
        }
    }, [business]);

    const fetchMenu = async () => {
        try {
            const response = await axios.get(`${API_URL}/menu-items/business/${business?.id}`);
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch menu', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Item', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`${API_URL}/menu-items/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        fetchMenu();
                    } catch (error: any) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to delete item');
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.m }]}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
                    Menu
                </Text>

                {loading ? (
                    <Text>Loading...</Text>
                ) : categories.length === 0 ? (
                    <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                        <Card.Content>
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>No menu items yet. Add your first item!</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    categories.map((category) => (
                        <View key={category.id} style={styles.categorySection}>
                            <Text variant="titleLarge" style={[styles.categoryTitle, { color: colors.secondary }]}>
                                {category.name}
                            </Text>
                            {category.items.map((item: any) => {
                                const imageSource =
                                    item.images && item.images.length > 0 && item.images[0] !== 'DEFAULT'
                                        ? { uri: item.images[0] }
                                        : require('../../../assets/food_placeholder.png');

                                return (
                                    <Card key={item.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                                        <Card.Cover source={imageSource} style={{ height: 120 }} />
                                        <Card.Content>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.cardInfo}>
                                                    <Text variant="titleMedium" style={{ color: colors.text, marginTop: 10 }}>
                                                        {item.name}
                                                    </Text>
                                                    <Text variant="bodyMedium" style={[styles.price, { color: colors.success }]}>
                                                        ${item.price}
                                                    </Text>
                                                    {item.description && (
                                                        <Text variant="bodySmall" style={[styles.description, { color: colors.textLight }]}>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                    {item.dietaryTags && item.dietaryTags.length > 0 && (
                                                        <View style={styles.tags}>
                                                            {item.dietaryTags.map((tag: string, idx: number) => (
                                                                <Chip key={idx} style={styles.tag} compact>
                                                                    {tag}
                                                                </Chip>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.actions}>
                                                    <IconButton icon="delete" size={20} iconColor={colors.error} onPress={() => handleDelete(item.id)} />
                                                </View>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                );
                            })}
                        </View>
                    ))
                )}
            </ScrollView>

            <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} color={colors.white} onPress={() => navigation.navigate('AddMenuItem')} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { padding: 20, paddingBottom: 80 },
    title: { marginBottom: 20, fontWeight: 'bold' },
    categorySection: { marginBottom: 25 },
    categoryTitle: { marginBottom: 10, fontWeight: 'bold', color: '#333' },
    card: { marginBottom: 10 },
    emptyCard: { marginTop: 50 },
    emptyText: { textAlign: 'center', color: '#666' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    cardInfo: { flex: 1 },
    price: { color: '#2e7d32', fontWeight: 'bold', marginTop: 5 },
    description: { color: '#666', marginTop: 3 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
    tag: { height: 24 },
    actions: { flexDirection: 'row' },
    fab: { position: 'absolute', right: 16, bottom: 16 },
});
