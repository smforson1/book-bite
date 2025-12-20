import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

interface ImageUploadProps {
    onImageUploaded: (url: string) => void;
    initialImage?: string;
    label?: string;
}

const API_URL = 'http://10.0.2.2:5000/api';

export default function ImageUpload({ onImageUploaded, initialImage, label }: ImageUploadProps) {
    const [image, setImage] = useState<string | null>(initialImage || null);
    const [uploading, setUploading] = useState(false);
    const { colors } = useTheme();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0];
            uploadImage(selectedImage.uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const formData = new FormData();

            // Extract file name and extension
            const filename = uri.split('/').pop() || 'upload.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);

            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageUrl = response.data.url;
            setImage(imageUrl);
            onImageUploaded(imageUrl);
            Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Error', 'Failed to upload image. Please check your backend and Cloudinary config.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={[styles.uploadBox, { borderColor: colors.outline }]}
                onPress={pickImage}
                disabled={uploading}
            >
                {image ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.image} />
                        <View style={styles.overlay}>
                            <IconButton icon="camera-flip" iconColor="#fff" size={24} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholder}>
                        <IconButton icon="camera-plus" size={40} iconColor={colors.primary} />
                        <Text variant="bodyMedium">Tap to select image</Text>
                    </View>
                )}

                {uploading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ marginTop: 10, color: colors.primary }}>Uploading...</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    label: {
        marginBottom: 8,
        fontWeight: '500',
        fontSize: 14,
    },
    uploadBox: {
        height: 180,
        width: '100%',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    placeholder: {
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
