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
import { useImageUpload } from '../hooks/useImageUpload';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
  allowMultiple?: boolean;
  title?: string;
  subtitle?: string;
  existingImages?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  maxImages = 5,
  allowMultiple = true,
  title = 'Upload Images',
  subtitle = 'Add photos of your service',
  existingImages = [],
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const {
    isUploading,
    uploadProgress,
    error,
    takePhoto,
    selectImages,
    clearUploadedImages,
  } = useImageUpload({
    onUploadSuccess: (result) => {
      if (result.urls && result.urls.length > 0) {
        const newImages = [...uploadedImages, ...result.urls];
        setUploadedImages(newImages);
        onImagesUploaded(newImages);
      } else if (result.url) {
        const newImages = [...uploadedImages, result.url];
        setUploadedImages(newImages);
        onImagesUploaded(newImages);
      }
    },
    onUploadError: (errorMessage) => {
      Alert.alert('Upload Error', errorMessage);
    },
  });

  const handleTakePhoto = async () => {
    if (uploadedImages.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }
    await takePhoto();
  };

  const handleSelectImages = async () => {
    if (uploadedImages.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }
    await selectImages(allowMultiple);
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);
  };

  const clearAllImages = () => {
    clearUploadedImages();
    setUploadedImages([]);
    onImagesUploaded([]);
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.h4, styles.title]}>{title}</Text>
      <Text style={[globalStyles.bodySmall, styles.subtitle]}>{subtitle}</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isUploading && (
        <View style={styles.uploadProgress}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.uploadProgressText}>Uploading... {uploadProgress}%</Text>
        </View>
      )}

      {uploadedImages.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreviewHeader}>
            <Text style={styles.imageCount}>
              {uploadedImages.length} of {maxImages} images
            </Text>
            <TouchableOpacity onPress={clearAllImages}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.imageGrid}>
            {uploadedImages.map((imageUrl, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
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

      <View style={styles.uploadButtons}>
        <TouchableOpacity
          style={[styles.uploadButton, styles.cameraButton]}
          onPress={handleTakePhoto}
          disabled={isUploading || uploadedImages.length >= maxImages}
        >
          <Ionicons 
            name="camera" 
            size={24} 
            color={isUploading || uploadedImages.length >= maxImages ? 
              theme.colors.text.tertiary : theme.colors.primary[500]} 
          />
          <Text style={[styles.buttonText, 
            isUploading || uploadedImages.length >= maxImages ? 
            styles.disabledText : styles.primaryText]}>
            Take Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, styles.galleryButton]}
          onPress={handleSelectImages}
          disabled={isUploading || uploadedImages.length >= maxImages}
        >
          <Ionicons 
            name="images" 
            size={24} 
            color={isUploading || uploadedImages.length >= maxImages ? 
              theme.colors.text.tertiary : theme.colors.secondary[500]} 
          />
          <Text style={[styles.buttonText,
            isUploading || uploadedImages.length >= maxImages ? 
            styles.disabledText : styles.secondaryText]}>
            Choose from Gallery
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hintText}>
        Tip: Upload clear, well-lit photos showing your service. This will help attract more customers.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  
  errorContainer: {
    backgroundColor: theme.colors.error[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  
  errorText: {
    color: theme.colors.error[500],
    fontSize: theme.typography.fontSize.sm,
  },
  
  uploadProgress: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  
  uploadProgressText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  
  imagePreviewContainer: {
    marginBottom: theme.spacing.md,
  },
  
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  imageCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  
  clearAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
  },
  
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.background.primary,
    borderRadius: 10,
  },
  
  uploadButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  
  cameraButton: {
    borderColor: theme.colors.primary[500],
  },
  
  galleryButton: {
    borderColor: theme.colors.secondary[500],
  },
  
  buttonText: {
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  primaryText: {
    color: theme.colors.primary[500],
  },
  
  secondaryText: {
    color: theme.colors.secondary[500],
  },
  
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  
  hintText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ImageUpload;