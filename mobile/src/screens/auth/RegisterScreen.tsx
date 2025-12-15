import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function RegisterScreen({ navigation }: any) {
    const [role, setRole] = useState('user');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [activationCode, setActivationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (role === 'manager' && !activationCode) {
            Alert.alert('Error', 'Activation code is required for managers');
            return;
        }

        setLoading(true);
        try {
            const endpoint = role === 'manager' ? '/auth/register-manager' : '/auth/register';
            const payload: any = { name, email, password, phone };

            if (role === 'manager') {
                payload.activationCode = activationCode;
            }

            const response = await axios.post(`${API_URL}${endpoint}`, payload);
            const { token, user } = response.data;

            login(token, user);
            Alert.alert('Success', `Welcome ${user.name}!`);
            navigation.navigate('Login');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>
                    Create Account
                </Text>

                <SegmentedButtons
                    value={role}
                    onValueChange={setRole}
                    buttons={[
                        { value: 'user', label: 'Customer' },
                        { value: 'manager', label: 'Manager' },
                    ]}
                    style={styles.segment}
                />

                <TextInput
                    label="Full Name *"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Email *"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    label="Password *"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                />
                <TextInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                />

                {role === 'manager' && (
                    <TextInput
                        label="Activation Code *"
                        value={activationCode}
                        onChangeText={setActivationCode}
                        style={styles.input}
                        mode="outlined"
                        placeholder="Enter code from Admin"
                    />
                )}

                <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={styles.button}
                    loading={loading}
                    disabled={loading}
                >
                    Sign Up
                </Button>

                <Button onPress={() => navigation.navigate('Login')} style={styles.textButton}>
                    Already have an account? Login
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    title: { marginBottom: 20, textAlign: 'center', marginTop: 20 },
    segment: { marginBottom: 20 },
    input: { marginBottom: 15 },
    button: { marginTop: 10, paddingVertical: 5 },
    textButton: { marginTop: 15 },
});
