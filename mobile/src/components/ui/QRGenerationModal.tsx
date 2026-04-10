import React, { useState } from 'react';
import { View, StyleSheet, Modal, Image, Share, ActivityIndicator } from 'react-native';
import { Text, Button, IconButton, Portal } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuthStore } from '../../store/useAuthStore';

interface QRModalProps {
    visible: boolean;
    onClose: () => void;
    businessId: string;
    locationId: string;
    locationName: string;
    type: 'TABLE' | 'ROOM';
}

export default function QRGenerationModal({ visible, onClose, businessId, locationId, locationName, type }: QRModalProps) {
    const { colors } = useTheme();
    const token = useAuthStore(state => state.token);
    const [qrData, setQrData] = useState<{ qrCode: string, deepLink: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const generateQR = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/qr/generate`, {
                params: { businessId, locationId, type },
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrData(res.data);
        } catch (error) {
            console.error('Failed to generate QR:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!qrData) return;
        try {
            await Share.share({
                message: `Scan this to order at ${locationName}: ${qrData.deepLink}`,
                title: `QR Code for ${locationName}`
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={[styles.content, { backgroundColor: colors.surface }]}>
                        <View style={styles.header}>
                            <Text variant="titleLarge">QR Code for {locationName}</Text>
                            <IconButton icon="close" onPress={onClose} />
                        </View>

                        <View style={styles.qrContainer}>
                            {loading ? (
                                <ActivityIndicator size="large" color={colors.primary} />
                            ) : qrData ? (
                                <Image source={{ uri: qrData.qrCode }} style={styles.qrImage} />
                            ) : (
                                <Button mode="contained" onPress={generateQR} buttonColor={colors.primary}>
                                    Generate QR Code
                                </Button>
                            )}
                        </View>

                        {qrData && (
                            <View style={styles.footer}>
                                <Text variant="bodySmall" style={{ color: colors.textLight, textAlign: 'center', marginBottom: 15 }}>
                                    Deep Link: {qrData.deepLink}
                                </Text>
                                <Button mode="outlined" icon="share-variant" onPress={handleShare} style={{ borderColor: colors.primary }} textColor={colors.primary}>
                                    Share QR Link
                                </Button>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    content: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 12,
        padding: 20,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        marginBottom: 20
    },
    qrImage: {
        width: 250,
        height: 250,
        borderRadius: 8
    },
    footer: {
        marginTop: 10
    }
});
