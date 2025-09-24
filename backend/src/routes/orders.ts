import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { 
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getUserOrders,
  getRestaurantOrders
} from '@/controllers/orderController';
import { authenticate, authorize } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';

const router = Router();

// Create order validation
const createOrderValidation = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Valid restaurant ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.menuItemId')
    .isMongoId()
    .withMessage('Valid menu item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
  body('items.*.specialInstructions')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Special instructions cannot exceed 200 characters'),
  body('deliveryAddress')
    .isLength({ min: 10, max: 300 })
    .withMessage('Delivery address must be between 10 and 300 characters'),
  body('deliveryCoordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('deliveryCoordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('deliveryInstructions')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Delivery instructions cannot exceed 300 characters')
];

// Update order status validation
const updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

// Query validation
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

// Routes

// Create new order
router.post(
  '/',
  authenticate,
  createOrderValidation,
  validateRequest,
  createOrder
);

// Get all orders (admin and restaurant owners see relevant orders)
router.get(
  '/',
  authenticate,
  queryValidation,
  validateRequest,
  getOrders
);

// Get user's orders
router.get(
  '/user',
  authenticate,
  queryValidation,
  validateRequest,
  getUserOrders
);

// Get restaurant's orders (for restaurant owners)
router.get(
  '/restaurant',
  authenticate,
  authorize(['restaurant_owner', 'admin']),
  queryValidation,
  validateRequest,
  getRestaurantOrders
);

// Get specific order by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Valid order ID is required'),
  validateRequest,
  getOrderById
);

// Update order status (restaurant owners and admin only)
router.put(
  '/:id/status',
  authenticate,
  authorize(['restaurant_owner', 'admin']),
  updateOrderStatusValidation,
  validateRequest,
  updateOrderStatus
);

// Cancel order (users can cancel their own orders)
router.put(
  '/:id/cancel',
  authenticate,
  param('id').isMongoId().withMessage('Valid order ID is required'),
  validateRequest,
  cancelOrder
);

export default router;