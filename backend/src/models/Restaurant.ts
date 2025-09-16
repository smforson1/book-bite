import mongoose, { Schema } from 'mongoose';
import { IRestaurant, GHANA_REGIONS } from '@/types';

const operatingHoursSchema = new Schema({
  open: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  close: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const restaurantSchema = new Schema<IRestaurant>({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    minlength: [2, 'Restaurant name must be at least 2 characters long'],
    maxlength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Restaurant description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  address: {
    type: String,
    required: [true, 'Restaurant address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters long'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^(\+233|0)[2-9]\d{8}$/, 'Please provide a valid Ghanaian phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  images: [{
    type: String,
    required: true
  }],
  cuisine: [{
    type: String,
    trim: true,
    required: true
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryTime: {
    type: String,
    required: [true, 'Delivery time is required'],
    trim: true,
    minlength: [5, 'Delivery time must be at least 5 characters long'],
    maxlength: [50, 'Delivery time cannot exceed 50 characters']
  },
  deliveryFee: {
    type: Number,
    required: [true, 'Delivery fee is required'],
    min: [0, 'Delivery fee cannot be negative']
  },
  minimumOrder: {
    type: Number,
    required: [true, 'Minimum order is required'],
    min: [0, 'Minimum order cannot be negative']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: GHANA_REGIONS
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    minlength: [2, 'City must be at least 2 characters long'],
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  operatingHours: {
    monday: { type: operatingHoursSchema, default: { open: '09:00', close: '22:00', isOpen: true } },
    tuesday: { type: operatingHoursSchema, default: { open: '09:00', close: '22:00', isOpen: true } },
    wednesday: { type: operatingHoursSchema, default: { open: '09:00', close: '22:00', isOpen: true } },
    thursday: { type: operatingHoursSchema, default: { open: '09:00', close: '22:00', isOpen: true } },
    friday: { type: operatingHoursSchema, default: { open: '09:00', close: '22:00', isOpen: true } },
    saturday: { type: operatingHoursSchema, default: { open: '09:00', close: '22:00', isOpen: true } },
    sunday: { type: operatingHoursSchema, default: { open: '09:00', close: '22:00', isOpen: true } }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ ownerId: 1 });
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ region: 1, city: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ name: 'text', description: 'text' });

// Virtual for menu items
restaurantSchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurantId'
});

// Virtual for reviews
restaurantSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'targetId',
  match: { targetType: 'restaurant' }
});

// Method to check if restaurant is currently open
restaurantSchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.operatingHours[dayOfWeek];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);