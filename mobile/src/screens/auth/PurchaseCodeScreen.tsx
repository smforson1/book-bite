import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
// @ts-ignore
// import { usePaystack } from 'react-native-paystack-webview';
import PaymentWebView from '../../components/ui/PaymentWebView';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PurchaseCodeScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [purchasedCode, setPurchasedCode] = useState('');
    const [paymentUrl, setPaymentUrl] = useState('');
    const [showWebView, setShowWebView] = useState(false);
    const [currentReference, setCurrentReference] = useState('');
    const theme = useTheme();

    const PRICE = 50.00; // 50 GHS

    const handleSuccess = async (res: any) => {
        const reference = res.reference || currentReference;

        if (!reference) {
            Alert.alert('Error', 'Payment reference missing. Please contact support.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://10.0.2.2:5000/api/payment/verify`, {
                reference,
                email,
                amount: PRICE,
                metadata: {
                    purpose: 'ACCESS_KEY',
                }
            });

            setPurchasedCode(response.data.code);
            Alert.alert('Success!', 'Your activation code has been generated. Copy it below to register.');
        } catch (error) {
            console.error('Verify error:', error);
            Alert.alert('Error', 'Failed to verify payment. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`http://10.0.2.2:5000/api/payment/initialize`, {
                email,
                amount: PRICE,
                metadata: {
                    purpose: 'ACCESS_KEY',
                }
            });

            setPaymentUrl(response.data.authorization_url);
            setCurrentReference(response.data.reference);
            setShowWebView(true);
        } catch (error: any) {
            console.error('Initialize error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || error.message;
            Alert.alert('Error', `Failed to initialize payment: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(purchasedCode);
        Alert.alert('Copied', 'Code copied to clipboard!');
    };

    if (purchasedCode) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text variant="headlineMedium" style={styles.title}>Payment Successful!</Text>
                    <Text style={styles.subtitle}>Here is your Manager Activation Code:</Text>

                    <TouchableOpacity onPress={copyToClipboard} style={styles.codeContainer}>
                        <Text style={styles.codeText}>{purchasedCode}</Text>
                    </TouchableOpacity>

                    <Button mode="contained" onPress={copyToClipboard} style={styles.button}>
                        Copy Code
                    </Button>

                    <Button mode="text" onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
                        Proceed to Registration
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text variant="headlineLarge" style={styles.title}>Get Access Key</Text>
                <Text style={styles.subtitle}>
                    Purchase a Manager Activation Key to convert your account or register a new business.
                </Text>

                <TextInput
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />

                <View style={styles.priceTag}>
                    <Text variant="titleMedium">Price:</Text>
                    <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        GH₵{PRICE.toLocaleString()}
                    </Text>
                </View>

                <Button
                    mode="contained"
                    style={styles.button}
                    disabled={!email || loading}
                    loading={loading}
                    onPress={handlePay}
                >
                    Pay With Paystack
                </Button>

                <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
                    Back to Login
                </Button>

                <PaymentWebView
                    visible={showWebView}
                    url={paymentUrl}
                    onClose={() => setShowWebView(false)}
                    onSuccess={(ref) => {
                        setShowWebView(false);
                        handleSuccess({ reference: ref });
                    }}
                    onCancel={() => {
                        setShowWebView(false);
                        Alert.alert('Cancelled', 'Payment was cancelled');
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 32,
    },
    input: {
        marginBottom: 20,
    },
    priceTag: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 24,
    },
    button: {
        paddingVertical: 6,
    },
    codeContainer: {
        padding: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed'
    },
    codeText: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 4,
        color: '#333'
    }
});
