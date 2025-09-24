import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerPushToken,
  unregisterPushToken,
  sendTestNotification,
  sendBroadcastNotification,
  getNotificationSettings,
  updateNotificationSettings
} from '@/controllers/notificationController';
import { authenticate, authorize } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';

const router = Router();

// Push token registration validation
const pushTokenValidation = [
  body('pushToken')
    .notEmpty()
    .withMessage('Push token is required')
    .matches(/^ExponentPushToken\[.+\]$/)
    .withMessage('Invalid Expo push token format')
];

// Test notification validation
const testNotificationValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('body')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Body must be between 1 and 200 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

// Broadcast notification validation
const broadcastNotificationValidation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be between 1 and 100 characters'),
  body('body')
    .isLength({ min: 1, max: 200 })
    .withMessage('Body is required and must be between 1 and 200 characters'),
  body('targetRole')
    .optional()
    .isIn(['user', 'hotel_owner', 'restaurant_owner'])
    .withMessage('Invalid target role'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

// Notification settings validation
const notificationSettingsValidation = [
  body('orderUpdates')
    .optional()
    .isBoolean()
    .withMessage('Order updates must be a boolean'),
  body('bookingUpdates')
    .optional()
    .isBoolean()
    .withMessage('Booking updates must be a boolean'),
  body('paymentUpdates')
    .optional()
    .isBoolean()
    .withMessage('Payment updates must be a boolean'),
  body('promotions')
    .optional()
    .isBoolean()
    .withMessage('Promotions must be a boolean'),
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean')
];

// Routes

// Register push token
router.post(
  '/register-token',
  authenticate,
  pushTokenValidation,
  validateRequest,
  registerPushToken
);

// Unregister push token
router.delete(
  '/unregister-token',
  authenticate,
  unregisterPushToken
);

// Send test notification
router.post(
  '/test',
  authenticate,
  testNotificationValidation,
  validateRequest,
  sendTestNotification
);

// Send broadcast notification (admin only)
router.post(
  '/broadcast',
  authenticate,
  authorize(['admin']),
  broadcastNotificationValidation,
  validateRequest,
  sendBroadcastNotification
);

// Get notification settings
router.get(
  '/settings',
  authenticate,
  getNotificationSettings
);

// Update notification settings
router.put(
  '/settings',
  authenticate,
  notificationSettingsValidation,
  validateRequest,
  updateNotificationSettings
);

export default router;