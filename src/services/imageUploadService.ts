import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { apiService } from './apiService';

export interface ImageUploadOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  allowsMultipleSelection?: boolean;
  mediaTypes?: 'Images' | 'Videos' | 'All';
  includeBase64?: boolean;
}

export interface UploadProgress {
  uploadId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  urls?: string[];
  error?: string;
  uploadId?: string;
}

class ImageUploadService {
  private uploadQueue: Map<string, UploadProgress> = new Map();
  private maxConcurrentUploads = 2; // Limited for Ghana's internet connectivity
  private activeUploads = 0;
  private retryAttempts = 3;
  private compressionQuality = 0.7; // Higher compression for slower internet

  constructor() {
    this.requestPermissions();
  }

  // Request camera and media library permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Take photo from camera
  async takePhoto(options: ImageUploadOptions = {}): Promise<ImageUploadResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Camera permission not granted'
        };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing || true,
        aspect: options.aspect || [4, 3],
        quality: options.quality || this.compressionQuality,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'User cancelled photo capture'
        };
      }

      const asset = result.assets[0];
      const processedImage = await this.processImage(asset.uri, options);
      return await this.uploadSingleImage(processedImage.uri, asset.fileName || 'camera_photo.jpg');
      
    } catch (error) {
      console.error('Error taking photo:', error);
      return {
        success: false,
        error: 'Failed to take photo'
      };
    }
  }

  // Select images from gallery
  async selectImages(options: ImageUploadOptions = {}): Promise<ImageUploadResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Media library permission not granted'
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing || false,
        aspect: options.aspect,
        quality: options.quality || this.compressionQuality,
        allowsMultipleSelection: options.allowsMultipleSelection || false,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'User cancelled image selection'
        };
      }

      if (result.assets.length === 1) {
        const asset = result.assets[0];
        const processedImage = await this.processImage(asset.uri, options);
        return await this.uploadSingleImage(processedImage.uri, asset.fileName || 'selected_image.jpg');
      } else {
        // Multiple images
        const uploadPromises = result.assets.map(async (asset) => {
          const processedImage = await this.processImage(asset.uri, options);
          return this.uploadSingleImage(processedImage.uri, asset.fileName || `image_${Date.now()}.jpg`);
        });

        const results = await Promise.all(uploadPromises);
        const urls = results.filter(r => r.success).map(r => r.url!);
        const errors = results.filter(r => !r.success);

        return {
          success: urls.length > 0,
          urls: urls,
          error: errors.length > 0 ? `${errors.length} uploads failed` : undefined
        };
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      return {
        success: false,
        error: 'Failed to select images'
      };
    }
  }

  // Process image (resize, compress)
  private async processImage(uri: string, options: ImageUploadOptions) {
    try {
      // Ghana-optimized settings for slower internet
      const maxWidth = options.maxWidth || 1200;
      const maxHeight = options.maxHeight || 1200;
      const quality = options.quality || this.compressionQuality;

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: maxWidth, height: maxHeight } }
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipulatedImage;
    } catch (error) {
      console.error('Error processing image:', error);
      return { uri }; // Return original if processing fails
    }
  }

  // Upload single image
  private async uploadSingleImage(uri: string, fileName: string): Promise<ImageUploadResult> {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Check file size (limit for Ghana's internet - 5MB max)
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size too large. Maximum 5MB allowed.'
        };
      }

      // Add to upload queue
      this.uploadQueue.set(uploadId, {
        uploadId,
        fileName,
        progress: 0,
        status: 'pending'
      });

      // Wait for available slot
      await this.waitForUploadSlot();

      // Update status
      this.updateUploadProgress(uploadId, { status: 'uploading', progress: 10 });

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      // Ghana-specific: Add location context for CDN optimization
      formData.append('region', 'ghana');
      formData.append('uploadId', uploadId);

      // Upload with progress tracking
      const result = await this.uploadWithProgress(formData, uploadId);

      if (result.success) {
        this.updateUploadProgress(uploadId, {
          status: 'completed',
          progress: 100,
          url: result.url
        });

        return {
          success: true,
          url: result.url,
          uploadId
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Upload error:', error);
      this.updateUploadProgress(uploadId, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        uploadId
      };
    } finally {
      this.activeUploads--;
      this.uploadQueue.delete(uploadId);
    }
  }

  // Upload with progress tracking and Ghana-optimized retry logic
  private async uploadWithProgress(formData: FormData, uploadId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    let attempt = 0;
    
    while (attempt < this.retryAttempts) {
      try {
        this.activeUploads++;

        // Simulate progress updates (real implementation would use XMLHttpRequest)
        const progressInterval = setInterval(() => {
          const current = this.uploadQueue.get(uploadId);
          if (current && current.progress < 90) {
            this.updateUploadProgress(uploadId, {
              progress: Math.min(current.progress + 10, 90)
            });
          }
        }, 1000);

        // Use API service for upload
        const response = await apiService.uploadFile(formData, 'images');

        clearInterval(progressInterval);

        if (response.success && response.data?.url) {
          return {
            success: true,
            url: response.data.url
          };
        } else {
          throw new Error(response.error || 'Upload failed');
        }

      } catch (error) {
        attempt++;
        console.error(`Upload attempt ${attempt} failed:`, error);

        if (attempt < this.retryAttempts) {
          // Ghana-specific: Longer retry delays for unstable connections
          const delay = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
          
          this.updateUploadProgress(uploadId, {
            progress: 0,
            status: 'uploading'
          });
        } else {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed after retries'
          };
        }
      }
    }

    return {
      success: false,
      error: 'Upload failed after all retry attempts'
    };
  }

  // Wait for available upload slot
  private async waitForUploadSlot(): Promise<void> {
    while (this.activeUploads >= this.maxConcurrentUploads) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Update upload progress
  private updateUploadProgress(uploadId: string, updates: Partial<UploadProgress>) {
    const current = this.uploadQueue.get(uploadId);
    if (current) {
      this.uploadQueue.set(uploadId, { ...current, ...updates });
    }
  }

  // Get upload progress
  getUploadProgress(uploadId: string): UploadProgress | null {
    return this.uploadQueue.get(uploadId) || null;
  }

  // Get all active uploads
  getAllActiveUploads(): UploadProgress[] {
    return Array.from(this.uploadQueue.values());
  }

  // Cancel upload
  cancelUpload(uploadId: string): boolean {
    const upload = this.uploadQueue.get(uploadId);
    if (upload && upload.status === 'uploading') {
      this.updateUploadProgress(uploadId, {
        status: 'failed',
        error: 'Upload cancelled by user'
      });
      return true;
    }
    return false;
  }

  // Clear completed uploads
  clearCompletedUploads() {
    for (const [uploadId, upload] of this.uploadQueue.entries()) {
      if (upload.status === 'completed' || upload.status === 'failed') {
        this.uploadQueue.delete(uploadId);
      }
    }
  }

  // Ghana-specific helper: Check network quality and adjust settings
  async optimizeForConnection(): Promise<void> {
    try {
      // This would integrate with network monitoring
      // For now, we'll adjust based on a simple connectivity test
      const startTime = Date.now();
      const response = await fetch('https://httpbin.org/delay/1', { 
        method: 'GET',
        cache: 'no-cache'
      });
      const responseTime = Date.now() - startTime;

      if (responseTime > 3000) {
        // Slow connection - reduce quality and concurrent uploads
        this.compressionQuality = 0.5;
        this.maxConcurrentUploads = 1;
        console.log('Slow connection detected - optimizing upload settings');
      } else if (responseTime > 1500) {
        // Medium connection
        this.compressionQuality = 0.6;
        this.maxConcurrentUploads = 2;
      } else {
        // Good connection
        this.compressionQuality = 0.8;
        this.maxConcurrentUploads = 3;
      }
    } catch (error) {
      // Error means very poor connection
      this.compressionQuality = 0.4;
      this.maxConcurrentUploads = 1;
      console.log('Very poor connection detected - using minimum quality settings');
    }
  }

  // Ghana-specific: Pre-process images for common use cases
  async prepareHotelImages(uris: string[]): Promise<string[]> {
    const processedUris: string[] = [];
    
    for (const uri of uris) {
      try {
        // Hotel photos - higher quality but still compressed
        const processed = await ImageManipulator.manipulateAsync(
          uri,
          [
            { resize: { width: 1400, height: 1050 } } // 4:3 aspect ratio
          ],
          {
            compress: 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        processedUris.push(processed.uri);
      } catch (error) {
        console.error('Error processing hotel image:', error);
        processedUris.push(uri); // Use original if processing fails
      }
    }
    
    return processedUris;
  }

  async prepareRestaurantImages(uris: string[]): Promise<string[]> {
    const processedUris: string[] = [];
    
    for (const uri of uris) {
      try {
        // Restaurant/food photos - optimized for food presentation
        const processed = await ImageManipulator.manipulateAsync(
          uri,
          [
            { resize: { width: 1200, height: 900 } } // Good for food photos
          ],
          {
            compress: 0.75,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        processedUris.push(processed.uri);
      } catch (error) {
        console.error('Error processing restaurant image:', error);
        processedUris.push(uri);
      }
    }
    
    return processedUris;
  }

  // Get Ghana-optimized image settings
  getGhanaOptimizedSettings() {
    return {
      maxFileSize: '5MB',
      recommendedDimensions: {
        hotel: '1400x1050',
        restaurant: '1200x900',
        profile: '400x400'
      },
      compressionQuality: this.compressionQuality,
      maxConcurrentUploads: this.maxConcurrentUploads,
      supportedFormats: ['JPEG', 'PNG'],
      tips: [
        'Upload during off-peak hours (10 PM - 6 AM) for better speeds',
        'Use WiFi when available for larger uploads',
        'Take photos in good lighting to reduce file processing time',
        'Multiple small uploads work better than single large uploads'
      ]
    };
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();
export default imageUploadService;