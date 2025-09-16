import mongoose, { Schema } from 'mongoose';
import { IMenuItem } from '@/types';

const nutritionalInfoSchema = new Schema({
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    min: [0, 'Carbs cannot be negative']
  },
  fat: {
    type: Number,
    min: [0, 'Fat cannot be negative']
  }
}, { _id: false });

const menuItemSchema = new Schema<IMenuItem>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    minlength: [2, 'Menu item name must be at least 2 characters long'],
    maxlength: [100, 'Menu item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Menu item description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Menu item price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    minlength: [2, 'Category must be at least 2 characters long'],
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  images: [{
    type: String,
    required: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  ingredients: [{
    type: String,
    trim: true,
    required: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  preparationTime: {
    type: String,
    required: [true, 'Preparation time is required'],
    trim: true,
    minlength: [5, 'Preparation time must be at least 5 characters long'],
    maxlength: [50, 'Preparation time cannot exceed 50 characters']
  },
  nutritionalInfo: {
    type: nutritionalInfoSchema
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
menuItemSchema.index({ restaurantId: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

// Virtual for restaurant
menuItemSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurantId',
  foreignField: '_id',
  justOne: true
});

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);