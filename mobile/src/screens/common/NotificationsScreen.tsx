import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Avatar, IconButton, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:5000/api';

export default function NotificationsScreen({ navigation }: any) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { token } = useAuthStore();
    const { colors } = useTheme();

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`${BASE_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: any) => (
        <Card
            style={[
                styles.card,
                { backgroundColor: item.read ? colors.surface : colors.primary + '10' }
            ]}
            onPress={() => markAsRead(item.id)}
        >
            <Card.Title
                title={item.title}
                subtitle={item.body}
                left={(props) => <Avatar.Icon {...props} icon="bell" style={{ backgroundColor: colors.primary }} />}
                right={(props) => !item.read && <IconButton {...props} icon="circle-small" iconColor={colors.primary} />}
            />
            <Card.Content>
                <Text variant="bodySmall" style={{ color: colors.textLight, marginTop: -10 }}>
                    {new Date(item.createdAt).toLocaleString()}
                </Text>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.center}>
                            <Avatar.Icon size={64} icon="bell-off" style={{ backgroundColor: colors.surface }} color={colors.textLight} />
                            <Text style={{ marginTop: 10, color: colors.textLight }}>No updates yet</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16 },
    card: { marginBottom: 12 },
    center: { alignItems: 'center', justifyContent: 'center', marginTop: 100 }
});
