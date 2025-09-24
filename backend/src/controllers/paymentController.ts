import { Response } from 'express';
import { PaymentService } from '@/services/paymentService';
import { Payment } from '@/models/Payment';
import { Order } from '@/models/Order';
import { Booking } from '@/models/Booking';
import { ApiResponse, AuthenticatedRequest } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { getSocketService } from '@/services/socketService';

export const initiatePayment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const { 
    amount, 
    currency = 'GHS', 
    paymentMethod, 
    referenceId, 
    type // 'booking' or 'order'
  } = req.body;

  // Validate the reference (order or booking exists)
  let targetEntity;
  if (type === 'order') {
    targetEntity = await Order.findById(referenceId);
    if (!targetEntity || targetEntity.userId.toString() !== userId.toString()) {
      res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      } as ApiResponse);
      return;
    }
  } else if (type === 'booking') {
    targetEntity = await Booking.findById(referenceId);
    if (!targetEntity || targetEntity.userId.toString() !== userId.toString()) {
      res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      } as ApiResponse);
      return;
    }
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid payment type. Must be "order" or "booking"'
    } as ApiResponse);
    return;
  }

  // Check if payment already exists and is successful
  const existingPayment = await Payment.findOne({
    [type === 'order' ? 'orderId' : 'bookingId']: referenceId,
    status: 'success'
  });

  if (existingPayment) {
    res.status(400).json({
      success: false,
      message: 'Payment already completed for this ' + type
    } as ApiResponse);
    return;
  }

  // Generate unique transaction reference
  const transactionId = PaymentService.generateReference('BB');

  // Create payment record
  const paymentData = {
    userId,
    [type === 'order' ? 'orderId' : 'bookingId']: referenceId,
    amount,
    currency,
    paymentMethod,
    transactionId,
    status: 'pending' as const
  };

  const payment = await PaymentService.createPaymentRecord(paymentData);

  // Initiate payment with the selected method
  const paymentRequest = {
    amount,
    currency,
    email: req.user!.email,
    phone: req.user!.phone,
    reference: transactionId,
    callback_url: `${process.env.FRONTEND_URL}/payment/callback`
  };

  const paymentResponse = await PaymentService.processPayment(paymentMethod, paymentRequest);

  if (!paymentResponse.success) {
    // Update payment status to failed
    await PaymentService.updatePaymentStatus(transactionId, 'failed', paymentResponse);
    
    res.status(400).json({
      success: false,
      message: paymentResponse.message
    } as ApiResponse);
    return;
  }

  logger.info(`Payment initiated: ${transactionId} for ${type} ${referenceId}`);

  res.status(200).json({
    success: true,
    message: 'Payment initiated successfully',
    data: {
      payment: {
        id: payment._id,
        transactionId,
        amount,
        currency,
        paymentMethod,
        status: 'pending'
      },
      paymentUrl: paymentResponse.authorization_url,
      accessCode: paymentResponse.access_code
    }
  } as ApiResponse);
});

export const verifyPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { transactionId } = req.params;

  const payment = await Payment.findOne({ transactionId })
    .populate('orderId')
    .populate('bookingId');

  if (!payment) {
    res.status(404).json({
      success: false,
      message: 'Payment not found'
    } as ApiResponse);
    return;
  }

  // Check if user owns this payment
  if (payment.userId.toString() !== req.user!._id.toString()) {
    res.status(403).json({
      success: false,
      message: 'Unauthorized to verify this payment'
    } as ApiResponse);
    return;
  }

  // If already successful, return success
  if (payment.status === 'success') {
    res.status(200).json({
      success: true,
      message: 'Payment already verified',
      data: { payment }
    } as ApiResponse);
    return;
  }

  // Verify payment with the payment provider
  const verificationResponse = await PaymentService.verifyPayment(payment.paymentMethod, transactionId);

  if (verificationResponse.success) {
    // Update payment status
    const updatedPayment = await PaymentService.updatePaymentStatus(
      transactionId, 
      'success', 
      verificationResponse.data
    );

    // Update order or booking payment status
    if (payment.orderId) {
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
        paymentMethod: payment.paymentMethod,
        transactionId,
        paymentDate: new Date()
      });

      // Emit order update
      try {
        const socketService = getSocketService();
        socketService.sendNotificationToUser(
          payment.userId.toString(),
          'Payment Successful',
          'Your order payment has been processed successfully',
          'success'
        );
      } catch (error) {
        logger.warn('Failed to emit payment notification:', error);
      }
    } else if (payment.bookingId) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: 'paid',
        paymentMethod: payment.paymentMethod,
        transactionId,
        paymentDate: new Date()
      });

      // Emit booking update
      try {
        const socketService = getSocketService();
        socketService.sendNotificationToUser(
          payment.userId.toString(),
          'Payment Successful',
          'Your booking payment has been processed successfully',
          'success'
        );
      } catch (error) {
        logger.warn('Failed to emit payment notification:', error);
      }
    }

    logger.info(`Payment verified successfully: ${transactionId}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { payment: updatedPayment }
    } as ApiResponse);
  } else {
    // Update payment status to failed
    await PaymentService.updatePaymentStatus(transactionId, 'failed', verificationResponse);

    res.status(400).json({
      success: false,
      message: 'Payment verification failed'
    } as ApiResponse);
  }
});

export const handlePaystackWebhook = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const hash = req.headers['x-paystack-signature'];
  const body = JSON.stringify(req.body);
  const expectedHash = require('crypto')
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body, 'utf8')
    .digest('hex');

  if (hash !== expectedHash) {
    res.status(400).json({
      success: false,
      message: 'Invalid signature'
    });
    return;
  }

  const event = req.body;
  
  if (event.event === 'charge.success') {
    const { reference, status, amount } = event.data;
    
    if (status === 'success') {
      const payment = await Payment.findOne({ transactionId: reference });
      
      if (payment && payment.status === 'pending') {
        // Update payment status
        await PaymentService.updatePaymentStatus(reference, 'success', event.data);
        
        // Update related order or booking
        if (payment.orderId) {
          await Order.findByIdAndUpdate(payment.orderId, {
            paymentStatus: 'paid',
            paymentDate: new Date()
          });
        } else if (payment.bookingId) {
          await Booking.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: 'paid',
            paymentDate: new Date()
          });
        }

        logger.info(`Webhook processed: Payment ${reference} marked as successful`);
      }
    }
  }

  res.status(200).json({ success: true });
});

export const getPaymentHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { userId };

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by payment method
  if (req.query.paymentMethod) {
    filter.paymentMethod = req.query.paymentMethod;
  }

  const payments = await Payment.find(filter)
    .populate('orderId', 'totalPrice createdAt')
    .populate('bookingId', 'totalPrice checkIn checkOut')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Payment history retrieved successfully',
    data: { payments },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  } as ApiResponse);
});

export const getPaymentMethods = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const paymentMethods = [
    {
      id: 'paystack',
      name: 'Paystack (Cards)',
      type: 'card',
      description: 'Pay with your debit/credit card',
      isActive: true,
      icon: 'card'
    },
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      description: 'Pay with MTN MoMo',
      isActive: true,
      icon: 'phone'
    },
    {
      id: 'vodafone_cash',
      name: 'Vodafone Cash',
      type: 'mobile_money',
      description: 'Pay with Vodafone Cash',
      isActive: false, // Not implemented yet
      icon: 'phone'
    },
    {
      id: 'airteltigo_money',
      name: 'AirtelTigo Money',
      type: 'mobile_money',
      description: 'Pay with AirtelTigo Money',
      isActive: false, // Not implemented yet
      icon: 'phone'
    },
    {
      id: 'palmpay',
      name: 'PalmPay',
      type: 'mobile_money',
      description: 'Pay with PalmPay',
      isActive: true,
      icon: 'phone'
    }
  ];

  res.status(200).json({
    success: true,
    message: 'Payment methods retrieved successfully',
    data: { paymentMethods }
  } as ApiResponse);
});