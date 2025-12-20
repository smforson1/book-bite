import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
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
    const { colors } = useTheme();

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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
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
                    theme={{ colors: { secondaryContainer: colors.primaryLight, onSecondaryContainer: colors.text, outline: colors.primary } }}
                />

                <TextInput
                    label="Full Name *"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                    activeOutlineColor={colors.primary}
                    outlineStyle={{ borderRadius: 10 }}
                    contentStyle={{ backgroundColor: colors.surface }}
                />
                <TextInput
                    label="Email *"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    activeOutlineColor={colors.primary}
                    outlineStyle={{ borderRadius: 10 }}
                    contentStyle={{ backgroundColor: colors.surface }}
                />
                <TextInput
                    label="Password *"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                    activeOutlineColor={colors.primary}
                    outlineStyle={{ borderRadius: 10 }}
                    contentStyle={{ backgroundColor: colors.surface }}
                />
                <TextInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                    activeOutlineColor={colors.primary}
                    outlineStyle={{ borderRadius: 10 }}
                    contentStyle={{ backgroundColor: colors.surface }}
                />

                {role === 'manager' && (
                    <TextInput
                        label="Activation Code *"
                        value={activationCode}
                        onChangeText={setActivationCode}
                        style={styles.input}
                        mode="outlined"
                        placeholder="Enter code from Admin"
                        activeOutlineColor={colors.primary}
                        outlineStyle={{ borderRadius: 10 }}
                        contentStyle={{ backgroundColor: colors.surface }}
                    />
                )}

                <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={styles.button}
                    loading={loading}
                    disabled={loading}
                    buttonColor={colors.primary}
                >
                    Sign Up
                </Button>

                <Button
                    onPress={() => navigation.navigate('Login')}
                    style={styles.textButton}
                    textColor={colors.secondary}
                >
                    Already have an account? Login
                </Button>

                {role === 'manager' && (
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('PurchaseCode')}
                        textColor={colors.primary}
                        style={{ marginTop: 10 }}
                    >
                        Need a Manager Key? Buy Here
                    </Button>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    title: { marginBottom: 20, textAlign: 'center', marginTop: 20, fontWeight: 'bold' },
    segment: { marginBottom: 20 },
    input: { marginBottom: 15 },
    button: { marginTop: 10, paddingVertical: 5, borderRadius: 8 },
    textButton: { marginTop: 15 },
});
