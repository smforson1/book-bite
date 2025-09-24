import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  initiatePayment,
  verifyPayment,
  handlePaystackWebhook,
  getPaymentHistory,
  getPaymentMethods
} from '@/controllers/paymentController';
import { authenticate } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { paymentLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Payment initiation validation
const initiatePaymentValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .optional()
    .isIn(['GHS', 'USD'])
    .withMessage('Currency must be GHS or USD'),
  body('paymentMethod')
    .isIn(['paystack', 'palmpay', 'mtn_momo', 'vodafone_cash', 'airteltigo_money'])
    .withMessage('Invalid payment method'),
  body('referenceId')
    .isMongoId()
    .withMessage('Valid reference ID is required'),
  body('type')
    .isIn(['order', 'booking'])
    .withMessage('Type must be either "order" or "booking"')
];

// Query validation for payment history
const paymentHistoryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['pending', 'success', 'failed', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('paymentMethod')
    .optional()
    .isIn(['paystack', 'palmpay', 'mtn_momo', 'vodafone_cash', 'airteltigo_money'])
    .withMessage('Invalid payment method filter')
];

// Routes

// Get available payment methods
router.get(
  '/methods',
  authenticate,
  getPaymentMethods
);

// Initiate payment
router.post(
  '/initiate',
  authenticate,
  paymentLimiter,
  initiatePaymentValidation,
  validateRequest,
  initiatePayment
);

// Verify payment
router.get(
  '/verify/:transactionId',
  authenticate,
  param('transactionId').notEmpty().withMessage('Transaction ID is required'),
  validateRequest,
  verifyPayment
);

// Get payment history
router.get(
  '/history',
  authenticate,
  paymentHistoryValidation,
  validateRequest,
  getPaymentHistory
);

// Paystack webhook (no authentication required)
router.post(
  '/webhook/paystack',
  handlePaystackWebhook
);

export default router;