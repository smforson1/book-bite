import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '@/types';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['user', 'hotel_owner', 'restaurant_owner', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    match: [/^(\+233|0)[2-9]\d{8}$/, 'Please provide a valid Ghanaian phone number']
  },
  avatar: {
    type: String
  },
  pushToken: {
    type: String,
    sparse: true // Allow multiple null values but unique non-null values
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ pushToken: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    (this as any).password = await bcrypt.hash((this as any).password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, (this as any).password);
  } catch (error) {
    return false;
  }
};

// Virtual for hotels (if user is hotel owner)
userSchema.virtual('hotels', {
  ref: 'Hotel',
  localField: '_id',
  foreignField: 'ownerId'
});

// Virtual for restaurants (if user is restaurant owner)
userSchema.virtual('restaurants', {
  ref: 'Restaurant',
  localField: '_id',
  foreignField: 'ownerId'
});

export const User = mongoose.model<IUser>('User', userSchema);