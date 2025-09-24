import mongoose, { Schema } from 'mongoose';
import { IRoom } from '@/types';

const roomSchema = new Schema<IRoom>({
  hotelId: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    minlength: [2, 'Room name must be at least 2 characters long'],
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10']
  },
  amenities: [{
    type: String,
    trim: true,
    required: true
  }],
  images: [{
    type: String,
    required: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['single', 'double', 'suite', 'deluxe']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
roomSchema.index({ hotelId: 1 });
roomSchema.index({ isAvailable: 1 });
roomSchema.index({ price: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ capacity: 1 });

// Compound index to ensure unique room numbers per hotel
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

// Virtual for hotel
roomSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotelId',
  foreignField: '_id',
  justOne: true
});

export const Room = mongoose.model<IRoom>('Room', roomSchema);