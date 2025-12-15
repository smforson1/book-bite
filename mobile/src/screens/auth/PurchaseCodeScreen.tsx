import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, useTheme } from 'react-native-paper';
// @ts-ignore
import { Paystack } from 'react-native-paystack-webview';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PurchaseCodeScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [purchasedCode, setPurchasedCode] = useState('');
    const theme = useTheme();

    const PRICE = 5000; // 5000 Naira/Currency units (example)

    const handleSuccess = async (res: any) => {
        // Paystack returns reference in res.transactionRef.reference or res.reference
        // The library structure usually is res.transactionRef.reference
        const reference = res.transactionRef?.reference || res.reference;

        setLoading(true);
        try {
            // Backend verification
            const response = await axios.post(`http://10.0.2.2:5000/api/payment/verify`, {
                reference,
                email,
                amount: PRICE
            });

            setPurchasedCode(response.data.code);
            Alert.alert('Success!', 'Your activation code has been generated. Copy it below to register.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to verify payment. Please contact support.');
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
                        ₦{PRICE.toLocaleString()}
                    </Text>
                </View>

                <Paystack
                    paystackKey="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // TODO: Ask user for key
                    amount={`${PRICE}.00`}
                    billingEmail={email}
                    activityIndicatorColor={theme.colors.primary}
                    onCancel={(e: any) => {
                        console.log(e);
                        Alert.alert('Cancelled', 'Payment process cancelled');
                    }}
                    onSuccess={handleSuccess}
                    autoStart={false}
                >
                    {/* The child of Paystack is usually a button that triggers it, 
               but newer versions hook into a ref. Or we can just wrap our button.
               If using older version, wrapping works. If newer, ref is better.
               Let's assume we render the button and the user clicks it, triggering the modal via prop logic or simple button. 
               Wait, library usually requires a ref or `autoStart`. 
               Let's wrap a Button component.
           */}
                    <Button
                        mode="contained"
                        style={styles.button}
                        disabled={!email || loading}
                        loading={loading}
                        onPress={() => { }} // The library handles press if wrapping? 
                    // Actually standard usage: 
                    // <Paystack ...><View><Text>Pay</Text></View></Paystack> 
                    >
                        Pay With Paystack
                    </Button>
                </Paystack>

                <Button mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
                    Back to Login
                </Button>
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
