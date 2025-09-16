import { useState, useCallback } from 'react';
import { imageUploadService, ImageUploadResult } from '../services/imageUploadService';

interface UseImageUploadOptions {
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadSuccess?: (result: ImageUploadResult) => void;
  onUploadError?: (error: string) => void;
  onUploadComplete?: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (imageUri: string, fileName?: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      options.onUploadStart?.();

      // Use the selectImages method with a single image
      const result = await imageUploadService.selectImages({
        allowsMultipleSelection: false
      });

      if (result.success) {
        if (result.url) {
          setUploadedImages(prev => [...prev, result.url as string]);
        } else if (result.urls && result.urls.length > 0) {
          const validUrls = result.urls.filter((url): url is string => url !== undefined);
          setUploadedImages(prev => [...prev, ...validUrls]);
        }
        options.onUploadSuccess?.(result);
      } else {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      options.onUploadError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
      options.onUploadComplete?.();
    }
  }, [options]);

  const uploadMultipleImages = useCallback(async (imageUris: string[]) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      options.onUploadStart?.();

      // For multiple images, we'll use selectImages with multiple selection
      const result = await imageUploadService.selectImages({
        allowsMultipleSelection: true
      });

      if (result.success) {
        if (result.urls && result.urls.length > 0) {
          const validUrls = result.urls.filter((url): url is string => url !== undefined);
          setUploadedImages(prev => [...prev, ...validUrls]);
          options.onUploadSuccess?.(result);
        } else if (result.url) {
          setUploadedImages(prev => [...prev, result.url as string]);
          options.onUploadSuccess?.(result);
        }
      } else {
        throw new Error(result.error || 'Batch upload failed');
      }

      return [result];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch upload failed';
      setError(errorMessage);
      options.onUploadError?.(errorMessage);
      return [{ success: false, error: errorMessage }];
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
      options.onUploadComplete?.();
    }
  }, [options]);

  const takePhoto = useCallback(async () => {
    try {
      setIsUploading(true);
      setError(null);
      options.onUploadStart?.();

      const result = await imageUploadService.takePhoto();
      
      if (result.success) {
        if (result.url) {
          setUploadedImages(prev => [...prev, result.url as string]);
        } else if (result.urls && result.urls.length > 0) {
          const validUrls = result.urls.filter((url): url is string => url !== undefined);
          setUploadedImages(prev => [...prev, ...validUrls]);
        }
        options.onUploadSuccess?.(result);
      } else {
        throw new Error(result.error || 'Photo capture failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Photo capture failed';
      setError(errorMessage);
      options.onUploadError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
      options.onUploadComplete?.();
    }
  }, [options]);

  const selectImages = useCallback(async (allowsMultiple: boolean = false) => {
    try {
      setIsUploading(true);
      setError(null);
      options.onUploadStart?.();

      const result = await imageUploadService.selectImages({
        allowsMultipleSelection: allowsMultiple
      });
      
      if (result.success) {
        if (result.url) {
          setUploadedImages(prev => [...prev, result.url as string]);
        } else if (result.urls && result.urls.length > 0) {
          const validUrls = result.urls.filter((url): url is string => url !== undefined);
          setUploadedImages(prev => [...prev, ...validUrls]);
        }
        options.onUploadSuccess?.(result);
      } else {
        throw new Error(result.error || 'Image selection failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image selection failed';
      setError(errorMessage);
      options.onUploadError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
      options.onUploadComplete?.();
    }
  }, [options]);

  const clearUploadedImages = useCallback(() => {
    setUploadedImages([]);
    setError(null);
    setUploadProgress(0);
  }, []);

  return {
    // State
    isUploading,
    uploadProgress,
    uploadedImages,
    error,
    
    // Actions
    uploadImage,
    uploadMultipleImages,
    takePhoto,
    selectImages,
    clearUploadedImages,
  };
}