import { Router } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
  getReviewStats
} from '@/controllers/reviewController';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { uploadLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 images per review
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Review creation validation
const createReviewValidation = [
  body('targetId')
    .isMongoId()
    .withMessage('Valid target ID is required'),
  body('targetType')
    .isIn(['hotel', 'restaurant'])
    .withMessage('Target type must be either "hotel" or "restaurant"'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

// Review update validation
const updateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid review ID is required'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

// Query validation for getting reviews
const getReviewsValidation = [
  query('targetId')
    .optional()
    .isMongoId()
    .withMessage('Valid target ID is required'),
  query('targetType')
    .optional()
    .isIn(['hotel', 'restaurant'])
    .withMessage('Target type must be either "hotel" or "restaurant"'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'rating', 'helpful'])
    .withMessage('Sort by must be one of: createdAt, rating, helpful'),
  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Minimum rating must be between 1 and 5'),
  query('verifiedOnly')
    .optional()
    .isBoolean()
    .withMessage('Verified only must be a boolean')
];

// Routes

// Create review (with optional image uploads)
router.post(
  '/',
  authenticate,
  uploadLimiter,
  upload.array('images', 5),
  createReviewValidation,
  validateRequest,
  createReview
);

// Get reviews (public endpoint with optional auth)
router.get(
  '/',
  optionalAuth,
  getReviewsValidation,
  validateRequest,
  getReviews
);

// Get user's reviews
router.get(
  '/user',
  authenticate,
  query('targetType')
    .optional()
    .isIn(['hotel', 'restaurant'])
    .withMessage('Target type must be either "hotel" or "restaurant"'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validateRequest,
  getUserReviews
);

// Get review statistics
router.get(
  '/stats',
  query('targetId')
    .isMongoId()
    .withMessage('Valid target ID is required'),
  query('targetType')
    .isIn(['hotel', 'restaurant'])
    .withMessage('Target type must be either "hotel" or "restaurant"'),
  validateRequest,
  getReviewStats
);

// Get specific review by ID
router.get(
  '/:id',
  optionalAuth,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validateRequest,
  getReviewById
);

// Update review (with optional image uploads)
router.put(
  '/:id',
  authenticate,
  uploadLimiter,
  upload.array('images', 5),
  updateReviewValidation,
  validateRequest,
  updateReview
);

// Delete review
router.delete(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validateRequest,
  deleteReview
);

// Mark review as helpful
router.post(
  '/:id/helpful',
  authenticate,
  param('id').isMongoId().withMessage('Valid review ID is required'),
  validateRequest,
  markReviewHelpful
);

export default router;