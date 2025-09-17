import { Router, Request, Response } from 'express';
import { authenticate } from '@/middleware/auth';
import { uploadLimiter } from '@/middleware/rateLimiter';
import { uploadSingle, uploadMultiple } from '@/middleware/upload';
import { uploadImage, uploadMultipleImages } from '@/config/cloudinary';
import { saveImageLocally, saveMultipleImagesLocally } from '@/config/localStorage';
import { asyncHandler } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';

const router = Router();

// Test upload endpoint (no auth required for testing)
router.post('/test', 
  uploadLimiter,
  uploadSingle('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file provided'
      } as ApiResponse);
      return;
    }

    const category = req.body.category || 'test';
    const imageUrl = await saveImageLocally(req.file, category);

    res.status(200).json({
      success: true,
      message: 'Test upload successful',
      data: { url: imageUrl }
    } as ApiResponse);
  })
);

// Single image upload
router.post('/image', 
  authenticate,
  uploadLimiter,
  uploadSingle('image'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      } as ApiResponse);
      return;
    }

    const category = req.body.category || 'general';
    
    let imageUrl: string;
    // Try Cloudinary first, fallback to local storage
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_CLOUD_NAME !== 'your-actual-cloud-name') {
      imageUrl = await uploadImage(req.file, category);
    } else {
      imageUrl = await saveImageLocally(req.file, category);
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url: imageUrl }
    } as ApiResponse);
  })
);

// Multiple images upload
router.post('/images',
  authenticate,
  uploadLimiter,
  uploadMultiple('images', 10),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No image files provided'
      } as ApiResponse);
      return;
    }

    const category = req.body.category || 'general';
    
    let imageUrls: string[];
    // Try Cloudinary first, fallback to local storage
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_CLOUD_NAME !== 'your-actual-cloud-name') {
      imageUrls = await uploadMultipleImages(req.files, category);
    } else {
      imageUrls = await saveMultipleImagesLocally(req.files, category);
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: { urls: imageUrls }
    } as ApiResponse);
  })
);

// Generic file upload
router.post('/',
  authenticate,
  uploadLimiter,
  uploadSingle('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file provided'
      } as ApiResponse);
      return;
    }

    const category = req.body.category || 'general';
    
    // Check if it's an image file
    if (req.file.mimetype.startsWith('image/')) {
      let imageUrl: string;
      // Try Cloudinary first, fallback to local storage
      if (process.env.CLOUDINARY_CLOUD_NAME && 
          process.env.CLOUDINARY_CLOUD_NAME !== 'your-actual-cloud-name') {
        imageUrl = await uploadImage(req.file, category);
      } else {
        imageUrl = await saveImageLocally(req.file, category);
      }
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: { url: imageUrl }
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        message: 'Only image files are supported'
      } as ApiResponse);
    }
  })
);

export default router;