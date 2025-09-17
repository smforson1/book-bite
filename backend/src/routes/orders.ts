import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getUserOrders
} from '@/controllers/orderController';
import { authenticate, authorize } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { orderValidation, mongoIdValidation } from '@/utils/validation';
import { body } from 'express-validator';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', orderValidation, handleValidationErrors, createOrder);
router.get('/user', getUserOrders);
router.get('/:id', mongoIdValidation('id'), handleValidationErrors, getOrderById);
router.patch('/:id/cancel', mongoIdValidation('id'), handleValidationErrors, cancelOrder);

// Restaurant owner and admin routes
router.get('/', authorize('restaurant_owner', 'admin'), getOrders);
router.patch('/:id/status',
  authorize('restaurant_owner', 'admin'),
  mongoIdValidation('id'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'])
      .withMessage('Invalid order status')
  ],
  handleValidationErrors,
  updateOrderStatus
);

export default router;