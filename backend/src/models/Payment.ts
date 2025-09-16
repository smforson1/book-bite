import mongoose, { Schema } from 'mongoose';
import { IPayment } from '@/types';

const paymentSchema = new Schema<IPayment>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'GHS',
        enum: ['GHS', 'USD']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: ['paystack', 'palmpay', 'mtn_momo', 'vodafone_cash', 'airteltigo_money']
    },
    transactionId: {
        type: String,
        required: [true, 'Transaction ID is required'],
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'cancelled'],
        default: 'pending'
    },
    gatewayResponse: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
paymentSchema.index({ userId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ createdAt: -1 });

// Ensure either orderId or bookingId is provided
paymentSchema.pre('validate', function (next) {
    if (!this.orderId && !this.bookingId) {
        next(new Error('Either orderId or bookingId must be provided'));
    } else if (this.orderId && this.bookingId) {
        next(new Error('Cannot have both orderId and bookingId'));
    } else {
        next();
    }
});

// Virtual for user
paymentSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual for order
paymentSchema.virtual('order', {
    ref: 'Order',
    localField: 'orderId',
    foreignField: '_id',
    justOne: true
});

// Virtual for booking
paymentSchema.virtual('booking', {
    ref: 'Booking',
    localField: 'bookingId',
    foreignField: '_id',
    justOne: true
});

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);