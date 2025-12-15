import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useBusinessStore } from '../../store/useBusinessStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api'; // Android emulator localhost

export default function BusinessSetup({ navigation }: any) {
    const [step, setStep] = useState(1);
    const [businessType, setBusinessType] = useState('HOTEL');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const token = useAuthStore((state) => state.token);
    const setBusiness = useBusinessStore((state) => state.setBusiness);

    const handleSubmit = async () => {
        if (!name || !address) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/business`,
                {
                    name,
                    type: businessType,
                    description,
                    address,
                    images: [],
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setBusiness(response.data);
            Alert.alert('Success', 'Business created successfully!');
            navigation.navigate('ManagerDashboard');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create business');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Set Up Your Business
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Step {step} of 2
                </Text>

                {step === 1 && (
                    <View>
                        <Text variant="titleMedium" style={styles.label}>
                            Business Type
                        </Text>
                        <SegmentedButtons
                            value={businessType}
                            onValueChange={setBusinessType}
                            buttons={[
                                { value: 'HOTEL', label: 'Hotel' },
                                { value: 'HOSTEL', label: 'Hostel' },
                                { value: 'RESTAURANT', label: 'Restaurant' },
                            ]}
                            style={styles.segment}
                        />

                        <TextInput
                            label="Business Name *"
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
                            numberOfLines={4}
                        />

                        <Button mode="contained" onPress={() => setStep(2)} style={styles.button}>
                            Next
                        </Button>
                    </View>
                )}

                {step === 2 && (
                    <View>
                        <TextInput
                            label="Address *"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.input}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                        />

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="bodyMedium" style={styles.infoText}>
                                    📸 Photo upload and location picker coming soon!
                                </Text>
                            </Card.Content>
                        </Card>

                        <View style={styles.buttonRow}>
                            <Button mode="outlined" onPress={() => setStep(1)} style={styles.halfButton}>
                                Back
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={loading}
                                style={styles.halfButton}
                            >
                                Create Business
                            </Button>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    title: { marginBottom: 5, textAlign: 'center' },
    subtitle: { marginBottom: 30, textAlign: 'center', color: '#666' },
    label: { marginBottom: 10, marginTop: 10 },
    segment: { marginBottom: 20 },
    input: { marginBottom: 15 },
    button: { marginTop: 20, paddingVertical: 5 },
    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
    halfButton: { flex: 1, paddingVertical: 5 },
    card: { marginVertical: 15 },
    infoText: { textAlign: 'center', color: '#666' },
});
