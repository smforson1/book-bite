import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import { apiService } from '../services/apiService';
import { ensureAuthenticated, quickLogin } from '../utils/authHelper';

export interface SimpleImageUploadProps {
    onImagesUploaded: (imageUrls: string[]) => void;
    maxImages?: number;
    allowMultiple?: boolean;
    title?: string;
    subtitle?: string;
    existingImages?: string[];
}

const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
    onImagesUploaded,
    maxImages = 5,
    allowMultiple = true,
    title = 'Upload Images',
    subtitle = 'Add photos of your service',
    existingImages = [],
}) => {
    const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
            return false;
        }
        return true;
    };

    const uploadImageToServer = async (imageUri: string): Promise<string | null> => {
        try {
            // Create FormData
            const formData = new FormData();

            // Add the image file
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'image.jpg',
            } as any);

            // Add category
            formData.append('category', 'hotel');

            // Make direct API call
            const response = await fetch(`${apiService.baseURL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await apiService.getAuthToken()}`,
                    // Don't set Content-Type - let the browser set it with boundary
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                return result.data.url;
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleSelectImages = async () => {
        if (uploadedImages.length >= maxImages) {
            Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
            return;
        }

        // Check authentication first
        const isAuthenticated = await ensureAuthenticated();
        if (!isAuthenticated) {
            // Try quick login
            Alert.alert(
                'Login Required',
                'You need to be logged in to upload images. Would you like to login now?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Login',
                        onPress: async () => {
                            const loginSuccess = await quickLogin();
                            if (loginSuccess) {
                                // Retry the upload after successful login
                                handleSelectImages();
                            }
                        }
                    }
                ]
            );
            return;
        }

        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: allowMultiple,
                quality: 0.8,
                aspect: [16, 9],
            });

            if (!result.canceled && result.assets.length > 0) {
                setIsUploading(true);
                setUploadProgress(0);

                const newImageUrls: string[] = [];

                for (let i = 0; i < result.assets.length; i++) {
                    const asset = result.assets[i];
                    setUploadProgress((i / result.assets.length) * 100);

                    try {
                        const uploadedUrl = await uploadImageToServer(asset.uri);
                        if (uploadedUrl) {
                            newImageUrls.push(uploadedUrl);
                        }
                    } catch (error) {
                        console.error(`Failed to upload image ${i + 1}:`, error);
                        Alert.alert('Upload Error', `Failed to upload image ${i + 1}`);
                    }
                }

                if (newImageUrls.length > 0) {
                    const allImages = [...uploadedImages, ...newImageUrls];
                    setUploadedImages(allImages);
                    onImagesUploaded(allImages);
                }

                setUploadProgress(100);
            }
        } catch (error) {
            console.error('Image selection error:', error);
            Alert.alert('Error', 'Failed to select images');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleTakePhoto = async () => {
        if (uploadedImages.length >= maxImages) {
            Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
            return;
        }

        // Check authentication first
        const isAuthenticated = await ensureAuthenticated();
        if (!isAuthenticated) {
            // Try quick login
            Alert.alert(
                'Login Required',
                'You need to be logged in to upload images. Would you like to login now?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Login',
                        onPress: async () => {
                            const loginSuccess = await quickLogin();
                            if (loginSuccess) {
                                // Retry the upload after successful login
                                handleTakePhoto();
                            }
                        }
                    }
                ]
            );
            return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                aspect: [16, 9],
            });

            if (!result.canceled && result.assets.length > 0) {
                setIsUploading(true);
                setUploadProgress(50);

                try {
                    const uploadedUrl = await uploadImageToServer(result.assets[0].uri);
                    if (uploadedUrl) {
                        const allImages = [...uploadedImages, uploadedUrl];
                        setUploadedImages(allImages);
                        onImagesUploaded(allImages);
                    }
                    setUploadProgress(100);
                } catch (error) {
                    console.error('Photo upload error:', error);
                    Alert.alert('Upload Error', 'Failed to upload photo');
                }
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...uploadedImages];
        newImages.splice(index, 1);
        setUploadedImages(newImages);
        onImagesUploaded(newImages);
    };

    const clearAllImages = () => {
        setUploadedImages([]);
        onImagesUploaded([]);
    };

    return (
        <View style={styles.container}>
            <Text style={[globalStyles.h4, styles.title]}>{title}</Text>
            <Text style={[globalStyles.bodySmall, styles.subtitle]}>{subtitle}</Text>

            {isUploading && (
                <View style={styles.uploadProgress}>
                    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                    <Text style={styles.progressText}>Uploading... {Math.round(uploadProgress)}%</Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.uploadButton, styles.selectButton]}
                    onPress={handleSelectImages}
                    disabled={isUploading}
                >
                    <Ionicons name="images-outline" size={24} color={theme.colors.primary[500]} />
                    <Text style={[styles.buttonText, { color: theme.colors.primary[500] }]}>
                        Select Images
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.uploadButton, styles.cameraButton]}
                    onPress={handleTakePhoto}
                    disabled={isUploading}
                >
                    <Ionicons name="camera-outline" size={24} color={theme.colors.neutral[0]} />
                    <Text style={[styles.buttonText, { color: theme.colors.neutral[0] }]}>
                        Take Photo
                    </Text>
                </TouchableOpacity>
            </View>

            {uploadedImages.length > 0 && (
                <View style={styles.imagesContainer}>
                    <View style={styles.imagesHeader}>
                        <Text style={[globalStyles.body, styles.imagesTitle]}>
                            Uploaded Images ({uploadedImages.length}/{maxImages})
                        </Text>
                        <TouchableOpacity onPress={clearAllImages}>
                            <Text style={[styles.clearButton]}>Clear All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
                        {uploadedImages.map((imageUrl, index) => (
                            <View key={index} style={styles.imageItem}>
                                <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color={theme.colors.error[500]} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: theme.colors.neutral[0],
        borderRadius: 12,
        marginVertical: 8,
    },
    title: {
        marginBottom: 4,
        color: theme.colors.text.primary,
    },
    subtitle: {
        marginBottom: 16,
        color: theme.colors.text.secondary,
    },
    uploadProgress: {
        alignItems: 'center',
        marginVertical: 16,
    },
    progressText: {
        marginTop: 8,
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    uploadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    selectButton: {
        backgroundColor: theme.colors.primary[50],
        borderWidth: 1,
        borderColor: theme.colors.primary[200],
    },
    cameraButton: {
        backgroundColor: theme.colors.primary[500],
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    imagesContainer: {
        marginTop: 16,
    },
    imagesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    imagesTitle: {
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    clearButton: {
        color: theme.colors.error[500],
        fontSize: 14,
        fontWeight: '600',
    },
    imagesList: {
        flexDirection: 'row',
    },
    imageItem: {
        position: 'relative',
        marginRight: 12,
    },
    uploadedImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: theme.colors.neutral[100],
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: theme.colors.neutral[0],
        borderRadius: 12,
    },
});

export default SimpleImageUpload;