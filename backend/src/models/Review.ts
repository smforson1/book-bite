import mongoose, { Schema } from 'mongoose';
import { IReview } from '@/types';

const reviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    required: [true, 'Target type is required'],
    enum: ['hotel', 'restaurant']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters long'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reviewSchema.index({ targetId: 1, targetType: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVerified: 1 });

// Compound index to prevent duplicate reviews from same user for same target
reviewSchema.index(
  { userId: 1, targetId: 1, targetType: 1 },
  { unique: true }
);

// Virtual for user
reviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for target (hotel or restaurant)
reviewSchema.virtual('target', {
  refPath: 'targetType',
  localField: 'targetId',
  foreignField: '_id',
  justOne: true
});

// Static method to calculate average rating for a target
reviewSchema.statics.calculateAverageRating = async function(targetId: string, targetType: string) {
  const stats = await this.aggregate([
    {
      $match: {
        targetId: new mongoose.Types.ObjectId(targetId),
        targetType: targetType
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const { averageRating, totalReviews } = stats[0];
    
    // Update the target model with new rating
    const targetModel = targetType === 'hotel' ? 'Hotel' : 'Restaurant';
    await mongoose.model(targetModel).findByIdAndUpdate(targetId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: totalReviews
    });

    return { averageRating, totalReviews };
  } else {
    // No reviews, reset rating
    const targetModel = targetType === 'hotel' ? 'Hotel' : 'Restaurant';
    await mongoose.model(targetModel).findByIdAndUpdate(targetId, {
      rating: 0,
      reviewCount: 0
    });

    return { averageRating: 0, totalReviews: 0 };
  }
};

// Post middleware to update target rating after save
reviewSchema.post('save', async function() {
  await (this.constructor as any).calculateAverageRating(this.targetId, this.targetType);
});

// Post middleware to update target rating after remove
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await (doc.constructor as any).calculateAverageRating(doc.targetId, doc.targetType);
  }
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);