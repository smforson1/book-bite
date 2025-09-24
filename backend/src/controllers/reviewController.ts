import { Response } from 'express';
import { Review } from '@/models/Review';
import { Hotel } from '@/models/Hotel';
import { Restaurant } from '@/models/Restaurant';
import { Order } from '@/models/Order';
import { Booking } from '@/models/Booking';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { uploadMultipleImages } from '@/config/cloudinary';

export const createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { targetId, targetType, rating, title, comment } = req.body;

  // Verify target exists
  let target;
  if (targetType === 'hotel') {
    target = await Hotel.findById(targetId);
  } else if (targetType === 'restaurant') {
    target = await Restaurant.findById(targetId);
  }

  if (!target) {
    res.status(404).json({
      success: false,
      message: `${targetType} not found`
    } as ApiResponse);
    return;
  }

  // Check if user has already reviewed this target
  const existingReview = await Review.findOne({ userId, targetId, targetType });
  if (existingReview) {
    res.status(400).json({
      success: false,
      message: 'You have already reviewed this ' + targetType
    } as ApiResponse);
    return;
  }

  // Verify user has actually used the service (optional but recommended)
  let hasUsedService = false;
  if (targetType === 'hotel') {
    const booking = await Booking.findOne({
      userId,
      hotelId: targetId,
      status: 'completed'
    });
    hasUsedService = !!booking;
  } else if (targetType === 'restaurant') {
    const order = await Order.findOne({
      userId,
      restaurantId: targetId,
      status: 'delivered'
    });
    hasUsedService = !!order;
  }

  // Handle image uploads if provided
  let imageUrls: string[] = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    try {
      imageUrls = await uploadMultipleImages(req.files, 'reviews');
    } catch (error) {
      logger.error('Error uploading review images:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to upload images'
      } as ApiResponse);
      return;
    }
  }

  const review = new Review({
    userId,
    targetId,
    targetType,
    rating,
    title,
    comment,
    images: imageUrls,
    isVerified: hasUsedService // Mark as verified if user has used the service
  });

  await review.save();

  // Populate review data
  await review.populate('userId', 'name avatar');

  logger.info(`New review created: ${review._id} for ${targetType} ${targetId} by user ${req.user!.email}`);

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: { review }
  } as ApiResponse);
});

export const getReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { targetId, targetType } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};
  
  if (targetId) {
    filter.targetId = targetId;
  }
  
  if (targetType) {
    filter.targetType = targetType;
  }

  // Sort options
  let sort: any = { createdAt: -1 }; // Default: newest first
  
  if (req.query.sortBy === 'rating') {
    sort = { rating: -1, createdAt: -1 };
  } else if (req.query.sortBy === 'helpful') {
    sort = { helpful: -1, createdAt: -1 };
  }

  // Filter by rating
  if (req.query.minRating) {
    filter.rating = { $gte: parseInt(req.query.minRating as string) };
  }

  // Filter by verified reviews only
  if (req.query.verifiedOnly === 'true') {
    filter.isVerified = true;
  }

  const reviews = await Review.find(filter)
    .populate('userId', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(filter);

  // Calculate rating distribution if targetId is provided
  let ratingDistribution;
  if (targetId) {
    const distribution = await Review.aggregate([
      { $match: { targetId: targetId, targetType: targetType } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    distribution.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });
  }

  res.status(200).json({
    success: true,
    message: 'Reviews retrieved successfully',
    data: { 
      reviews,
      ratingDistribution
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getReviewById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const review = await Review.findById(id)
    .populate('userId', 'name avatar')
    .populate('targetId');

  if (!review) {
    res.status(404).json({
      success: false,
      message: 'Review not found'
    } as ApiResponse);
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Review retrieved successfully',
    data: { review }
  } as ApiResponse);
});

export const updateReview = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    res.status(404).json({
      success: false,
      message: 'Review not found'
    } as ApiResponse);
    return;
  }

  // Check if user owns the review
  if (review.userId.toString() !== req.user!._id.toString()) {
    res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    } as ApiResponse);
    return;
  }

  // Handle image uploads if provided
  let imageUrls = review.images;
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    try {
      imageUrls = await uploadMultipleImages(req.files, 'reviews');
    } catch (error) {
      logger.error('Error uploading review images:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to upload images'
      } as ApiResponse);
      return;
    }
  }

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    {
      rating,
      title,
      comment,
      images: imageUrls
    },
    { new: true, runValidators: true }
  ).populate('userId', 'name avatar');

  logger.info(`Review updated: ${id} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: { review: updatedReview }
  } as ApiResponse);
});

export const deleteReview = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    res.status(404).json({
      success: false,
      message: 'Review not found'
    } as ApiResponse);
    return;
  }

  // Check if user owns the review or is admin
  if (review.userId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    } as ApiResponse);
    return;
  }

  await Review.findByIdAndDelete(id);

  logger.info(`Review deleted: ${id} by user ${req.user!.email}`);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  } as ApiResponse);
});

export const markReviewHelpful = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    res.status(404).json({
      success: false,
      message: 'Review not found'
    } as ApiResponse);
    return;
  }

  // Increment helpful count
  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { $inc: { helpful: 1 } },
    { new: true }
  ).populate('userId', 'name avatar');

  res.status(200).json({
    success: true,
    message: 'Review marked as helpful',
    data: { review: updatedReview }
  } as ApiResponse);
});

export const getUserReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { userId };

  // Filter by target type
  if (req.query.targetType) {
    filter.targetType = req.query.targetType;
  }

  const reviews = await Review.find(filter)
    .populate('targetId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'User reviews retrieved successfully',
    data: { reviews },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getReviewStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { targetId, targetType } = req.query;

  if (!targetId || !targetType) {
    res.status(400).json({
      success: false,
      message: 'Target ID and type are required'
    } as ApiResponse);
    return;
  }

  const stats = await Review.aggregate([
    {
      $match: {
        targetId: targetId,
        targetType: targetType
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        verifiedReviews: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    }
  ]);

  const ratingDistribution = await Review.aggregate([
    {
      $match: {
        targetId: targetId,
        targetType: targetType
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratingDistribution.forEach(item => {
    const rating = item._id as keyof typeof distribution;
    distribution[rating] = item.count;
  });

  const result = stats.length > 0 ? stats[0] : {
    averageRating: 0,
    totalReviews: 0,
    verifiedReviews: 0
  };

  res.status(200).json({
    success: true,
    message: 'Review statistics retrieved successfully',
    data: {
      ...result,
      ratingDistribution: distribution
    }
  } as ApiResponse);
});