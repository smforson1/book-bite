import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Avatar.Text size={80} label={user?.name?.[0] || 'U'} />
                <Text variant="headlineSmall" style={styles.name}>
                    {user?.name}
                </Text>
                <Text variant="bodyMedium" style={styles.email}>
                    {user?.email}
                </Text>

                {/* Placeholder for role display */}
                <Text variant="bodySmall" style={styles.role}>
                    {user?.role}
                </Text>
            </View>

            <View style={styles.content}>
                <Button mode="contained" onPress={handleLogout} buttonColor="#d32f2f">
                    Logout
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { alignItems: 'center', padding: 40, backgroundColor: '#f5f5f5' },
    name: { marginTop: 15, fontWeight: 'bold' },
    email: { color: '#666' },
    role: { marginTop: 5, color: '#888', textTransform: 'uppercase', fontSize: 10 },
    content: { padding: 20 },
});
