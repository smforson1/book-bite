import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Searchbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function HomeScreen({ navigation }: any) {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const fetchBusinesses = async () => {
        try {
            let url = `${API_URL}/business`;
            // In a real app, we'd pass filters as query params
            // For now we'll filter on client or assume API returns all public businesses
            const response = await axios.get(url);
            setBusinesses(response.data);
        } catch (error) {
            console.error('Failed to fetch businesses', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBusinesses();
    };

    const filteredBusinesses = businesses.filter((b) => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType ? b.type === selectedType : true;
        return matchesSearch && matchesType;
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.title}>
                    Book Bite
                </Text>
                <Searchbar
                    placeholder="Search hotels, restaurants..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />
                <View style={styles.filters}>
                    <Chip
                        selected={selectedType === null}
                        onPress={() => setSelectedType(null)}
                        style={styles.chip}
                    >
                        All
                    </Chip>
                    <Chip
                        selected={selectedType === 'HOTEL'}
                        onPress={() => setSelectedType('HOTEL')}
                        style={styles.chip}
                    >
                        Hotels
                    </Chip>
                    <Chip
                        selected={selectedType === 'RESTAURANT'}
                        onPress={() => setSelectedType('RESTAURANT')}
                        style={styles.chip}
                    >
                        Restaurants
                    </Chip>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {filteredBusinesses.map((business) => (
                    <Card
                        key={business.id}
                        style={styles.card}
                        onPress={() => navigation.navigate('BusinessDetails', { id: business.id })}
                    >
                        <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
                        <Card.Content style={styles.cardContent}>
                            <Text variant="titleLarge">{business.name}</Text>
                            <Text variant="bodyMedium" style={{ color: '#666' }}>
                                {business.type} • {business.address}
                            </Text>
                            <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
                                {business.description || 'No description available.'}
                            </Text>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 20, backgroundColor: '#fff', paddingBottom: 10 },
    title: { fontWeight: 'bold', marginBottom: 15 },
    searchbar: { marginBottom: 10 },
    filters: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
    chip: { marginRight: 5 },
    content: { padding: 20 },
    card: { marginBottom: 20 },
    cardContent: { marginTop: 10 },
    description: { marginTop: 5, color: '#888' },
});
