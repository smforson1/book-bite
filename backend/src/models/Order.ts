import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem } from '@/types';

const orderItemSchema = new Schema<IOrderItem>({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: [true, 'Menu item ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [50, 'Quantity cannot exceed 50']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  specialInstructions: {
    type: String,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  }
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true,
    minlength: [10, 'Delivery address must be at least 10 characters long'],
    maxlength: [300, 'Delivery address cannot exceed 300 characters']
  },
  deliveryCoordinates: {
    latitude: {
      type: Number,
      required: [true, 'Delivery latitude is required'],
      min: [-90, 'Invalid latitude'],
      max: [90, 'Invalid latitude']
    },
    longitude: {
      type: Number,
      required: [true, 'Delivery longitude is required'],
      min: [-180, 'Invalid longitude'],
      max: [180, 'Invalid longitude']
    }
  },
  deliveryDetails: {
    streetAddress: { type: String },
    apartmentNumber: { type: String },
    floor: { type: String },
    buildingName: { type: String },
    landmark: { type: String },
    contactPhone: { type: String },
    label: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Other'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'palmpay', 'mtn_momo', 'vodafone_cash', 'airteltigo_money']
  },
  transactionId: {
    type: String,
    sparse: true
  },
  paymentDate: {
    type: Date
  },
  estimatedDeliveryTime: {
    type: Date,
    required: [true, 'Estimated delivery time is required']
  },
  actualDeliveryTime: {
    type: Date
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryInstructions: {
    type: String,
    maxlength: [300, 'Delivery instructions cannot exceed 300 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ userId: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ estimatedDeliveryTime: 1 });

// Virtual for user
orderSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for restaurant
orderSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurantId',
  foreignField: '_id',
  justOne: true
});

// Virtual for driver
orderSchema.virtual('driver', {
  ref: 'User',
  localField: 'driverId',
  foreignField: '_id',
  justOne: true
});

// Method to calculate delivery time based on restaurant's delivery time
orderSchema.methods.calculateEstimatedDeliveryTime = function() {
  const now = new Date();
  // Add 30-60 minutes for preparation and delivery
  const estimatedMinutes = 30 + Math.floor(Math.random() * 30);
  return new Date(now.getTime() + estimatedMinutes * 60000);
};

export const Order = mongoose.model<IOrder>('Order', orderSchema);