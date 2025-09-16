import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components';
import ImageUpload from '../components/ImageUpload';
import { theme } from '../styles/theme';

const ImageUploadTest: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImagesUploaded = (imageUrls: string[]) => {
    setUploadedImages(imageUrls);
    console.log('Images uploaded:', imageUrls);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Upload Test</Text>
      
      <ImageUpload
        onImagesUploaded={handleImagesUploaded}
        maxImages={5}
        allowMultiple={true}
        title="Test Image Upload"
        subtitle="Upload some test images"
      />
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Uploaded Images ({uploadedImages.length})</Text>
        {uploadedImages.map((url, index) => (
          <Text key={index} style={styles.imageURL}>
            {url}
          </Text>
        ))}
      </View>
      
      <Button
        title="Reset"
        onPress={() => setUploadedImages([])}
        variant="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  imageURL: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontFamily: 'monospace',
  },
});

export default ImageUploadTest;