import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = response.data;

            login(token, user);
            Alert.alert('Success', `Welcome ${user.name}!`);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    mode="outlined"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                />

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.button}
                    loading={loading}
                    disabled={loading}
                >
                    Login
                </Button>
                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.linkButton}
                >
                    Don't have an account? Sign Up
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('PurchaseCode')}
                    textColor="#4F46E5"
                    style={{ marginTop: -10 }}
                >
                    Need a Manager Key? Buy Here
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20, justifyContent: 'center', flex: 1 },
    title: { marginBottom: 30, textAlign: 'center' },
    input: { marginBottom: 15 },
    button: { marginTop: 10, paddingVertical: 5 },
    textButton: {
        marginTop: 10,
    },
    linkButton: {
        marginTop: 10,
    }
});
