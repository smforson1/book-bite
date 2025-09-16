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
      message: 'Order must contain at least one item'
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
    maxlength: [200, 'Delivery address cannot exceed 200 characters']
  },
  deliveryCoordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
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
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
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

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate estimated delivery time
orderSchema.methods.calculateEstimatedDeliveryTime = function(restaurantDeliveryTime: string) {
  const now = new Date();
  const deliveryMinutes = parseInt(restaurantDeliveryTime.match(/\d+/)?.[0] || '30');
  return new Date(now.getTime() + deliveryMinutes * 60000);
};

export const Order = mongoose.model<IOrder>('Order', orderSchema);