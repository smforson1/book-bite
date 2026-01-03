import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

    useFocusEffect(
        useCallback(() => {
            if (business) {
                fetchMenu();
            }
        }, [business])
    );

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
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
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
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
                            >
                                {category.items.map((item: any) => {
                                    const imageSource =
                                        item.images && item.images.length > 0 && item.images[0] !== 'DEFAULT'
                                            ? { uri: item.images[0] }
                                            : { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000' };

                                    return (
                                        <Card key={item.id} style={[styles.horizontalCard, { backgroundColor: colors.surface }]}>
                                            <Card.Cover source={imageSource} style={styles.horizontalCardImage} />
                                            <Card.Content style={{ padding: 10 }}>
                                                <View style={styles.cardHeader}>
                                                    <View style={styles.cardInfo}>
                                                        <Text variant="titleMedium" numberOfLines={1} style={{ color: colors.text }}>
                                                            {item.name}
                                                        </Text>
                                                        <Text variant="bodyMedium" style={[styles.price, { color: colors.success }]}>
                                                            GH₵{item.price}
                                                        </Text>
                                                        {item.description && (
                                                            <Text variant="bodySmall" numberOfLines={1} style={[styles.description, { color: colors.textLight }]}>
                                                                {item.description}
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <IconButton
                                                        icon="delete"
                                                        size={18}
                                                        iconColor={colors.error}
                                                        onPress={() => handleDelete(item.id)}
                                                        style={{ margin: 0 }}
                                                    />
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    ))
                )}
            </ScrollView>

            <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} color={colors.white} onPress={() => navigation.navigate('AddMenuItem')} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 120 },
    title: { marginBottom: 20, fontWeight: 'bold' },
    categorySection: { marginBottom: 25 },
    categoryTitle: { marginBottom: 10, fontWeight: 'bold' },
    card: { marginBottom: 10 },
    horizontalCard: {
        width: 200,
        marginRight: 2,
        overflow: 'hidden',
    },
    horizontalCardImage: {
        height: 100
    },
    emptyCard: { marginTop: 50 },
    emptyText: { textAlign: 'center' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    cardInfo: { flex: 1 },
    price: { fontWeight: 'bold', marginTop: 5 },
    description: { marginTop: 3 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
    tag: { height: 24 },
    actions: { flexDirection: 'row' },
    fab: { position: 'absolute', right: 16, bottom: 100 },
});
