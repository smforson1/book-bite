import React from 'react';
import { Modal, StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentWebViewProps {
    visible: boolean;
    url: string;
    onClose: () => void;
    onSuccess: (reference: string) => void;
    onCancel: () => void;
}

export default function PaymentWebView({ visible, url, onClose, onSuccess, onCancel }: PaymentWebViewProps) {

    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        const { url: currentUrl } = navState;

        // Paystack usually redirects to a callback URL after success
        // We look for 'success', 'callback', or the specific 'standard.paystack.co/close'
        const isSuccessPage = currentUrl.includes('success') ||
            currentUrl.includes('callback') ||
            currentUrl.includes('paystack.co/close');

        if (isSuccessPage) {
            // Extract reference from URL if possible
            const referenceMatch = currentUrl.match(/[?&]reference=([^&]+)/) ||
                currentUrl.match(/[?&]trxref=([^&]+)/);

            if (referenceMatch) {
                onSuccess(referenceMatch[1]);
            } else {
                // If it's a success page but no reference in the URL (like the /close page)
                // we still trigger onSuccess so the parent can proceed using its local reference.
                onSuccess('');
            }
        } else if (currentUrl.includes('cancel') || currentUrl.includes('fail')) {
            onCancel();
        }
    };

    if (!url) return null;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text variant="titleLarge">Secure Payment</Text>
                    <IconButton icon="close" onPress={onClose} />
                </View>

                <WebView
                    source={{ uri: url }}
                    onNavigationStateChange={handleNavigationStateChange}
                    startInLoadingState
                    renderLoading={() => (
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color="#6200ee" />
                        </View>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
