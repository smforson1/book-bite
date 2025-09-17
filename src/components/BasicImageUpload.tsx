import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export interface BasicImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
  title?: string;
  subtitle?: string;
}

const BasicImageUpload: React.FC<BasicImageUploadProps> = ({
  onImagesUploaded,
  maxImages = 5,
  title = 'Upload Images',
  subtitle = 'Select images from your gallery',
}) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectImages = async () => {
    try {
      setIsLoading(true);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to select images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets.length > 0) {
        // For now, just use the local URIs (no server upload)
        const imageUris = result.assets.map(asset => asset.uri);
        const newImages = [...selectedImages, ...imageUris].slice(0, maxImages);

        setSelectedImages(newImages);
        onImagesUploaded(newImages);

        Alert.alert(
          'Images Selected',
          `Selected ${imageUris.length} image(s). Note: These are stored locally for demo purposes.`
        );
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select images');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setIsLoading(true);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImage = result.assets[0].uri;
        const newImages = [...selectedImages, newImage].slice(0, maxImages);

        setSelectedImages(newImages);
        onImagesUploaded(newImages);

        Alert.alert(
          'Photo Taken',
          'Photo captured successfully! Note: This is stored locally for demo purposes.'
        );
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    onImagesUploaded(newImages);
  };

  const clearAll = () => {
    setSelectedImages([]);
    onImagesUploaded([]);
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.h4, styles.title]}>{title}</Text>
      <Text style={[globalStyles.bodySmall, styles.subtitle]}>{subtitle}</Text>

      <View style={styles.demoNotice}>
        <Ionicons name="information-circle-outline" size={16} color={theme.colors.warning[600]} />
        <Text style={styles.demoText}>
          Demo Mode: Images are stored locally (no server upload required)
        </Text>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.selectButton]}
          onPress={selectImages}
          disabled={isLoading || selectedImages.length >= maxImages}
        >
          <Ionicons name="images-outline" size={24} color={theme.colors.primary[500]} />
          <Text style={[styles.buttonText, { color: theme.colors.primary[500] }]}>
            Select Images
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={takePhoto}
          disabled={isLoading || selectedImages.length >= maxImages}
        >
          <Ionicons name="camera-outline" size={24} color={theme.colors.neutral[0]} />
          <Text style={[styles.buttonText, { color: theme.colors.neutral[0] }]}>
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>

      {selectedImages.length > 0 && (
        <View style={styles.imagesContainer}>
          <View style={styles.imagesHeader}>
            <Text style={styles.imagesTitle}>
              Selected Images ({selectedImages.length}/{maxImages})
            </Text>
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageGrid}>
            {selectedImages.map((imageUri, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={20} color={theme.colors.error[500]} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
    marginBottom: 12,
    color: theme.colors.text.secondary,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  demoText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.warning[700],
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
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
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  clearButton: {
    color: theme.colors.error[500],
    fontSize: 14,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[100],
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.neutral[0],
    borderRadius: 10,
    padding: 2,
  },
});

export default BasicImageUpload;