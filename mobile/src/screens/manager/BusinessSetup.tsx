import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import ImageUpload from '../../components/ui/ImageUpload';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function BusinessSetup({ navigation }: any) {
    const [name, setName] = useState('');
    const [type, setType] = useState('HOTEL');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const token = useAuthStore((state) => state.token);
    const setBusiness = useBusinessStore((state) => state.setBusiness);
    const theme = useTheme();

    const handleSubmit = async () => {
        if (!name || !address || !description) {
            Alert.alert('Error', 'Please fill in name, address, and description');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/business`,
                {
                    name,
                    type,
                    description,
                    address,
                    images: imageUrl ? [imageUrl] : [],
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setBusiness(response.data);
            Alert.alert('Success', 'Business details saved successfully!');
            navigation.replace('ManagerDashboard');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save business');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                    Business Setup
                </Text>
                <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                    Provide your business details to get started.
                </Text>

                <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Card.Content>
                        <ImageUpload
                            label="Business Banner/Photo"
                            onImageUploaded={(url) => setImageUrl(url)}
                            initialImage={imageUrl}
                        />

                        <TextInput
                            label="Business Name *"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            activeOutlineColor={theme.colors.primary}
                            outlineStyle={{ borderRadius: 10 }}
                            contentStyle={{ backgroundColor: theme.colors.surface }}
                        />

                        <Text variant="titleMedium" style={styles.label}>
                            Business Type
                        </Text>
                        <SegmentedButtons
                            value={type}
                            onValueChange={setType}
                            buttons={[
                                { value: 'HOTEL', label: 'Hotel' },
                                { value: 'HOSTEL', label: 'Hostel' },
                                { value: 'RESTAURANT', label: 'Restaurant' },
                            ]}
                            style={styles.segment}
                            theme={{ colors: { secondaryContainer: theme.colors.primaryContainer } }}
                        />

                        <TextInput
                            label="Address *"
                            value={address}
                            onChangeText={setAddress}
                            mode="outlined"
                            style={styles.input}
                            multiline
                            numberOfLines={2}
                            activeOutlineColor={theme.colors.primary}
                            outlineStyle={{ borderRadius: 10 }}
                            contentStyle={{ backgroundColor: theme.colors.surface }}
                        />

                        <TextInput
                            label="Description *"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined"
                            style={styles.input}
                            multiline
                            numberOfLines={4}
                            activeOutlineColor={theme.colors.primary}
                            outlineStyle={{ borderRadius: 10 }}
                            contentStyle={{ backgroundColor: theme.colors.surface }}
                        />
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    buttonColor={theme.colors.primary}
                >
                    Complete Setup
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20 },
    title: { marginBottom: 5, textAlign: 'center', fontWeight: 'bold' },
    subtitle: { marginBottom: 30, textAlign: 'center' },
    label: { marginBottom: 10, marginTop: 10 },
    segment: { marginBottom: 20 },
    input: { marginBottom: 15 },
    button: { marginTop: 10, paddingVertical: 5, borderRadius: 8 },
    card: { marginVertical: 15, borderRadius: 15, elevation: 2 },
});
