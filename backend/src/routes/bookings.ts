import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getUserBookings
} from '@/controllers/bookingController';
import { authenticate, authorize } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { bookingValidation, mongoIdValidation } from '@/utils/validation';
import { body } from 'express-validator';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// User routes
router.post('/', bookingValidation, handleValidationErrors, createBooking);
router.get('/user', getUserBookings);
router.get('/:id', mongoIdValidation('id'), handleValidationErrors, getBookingById);
router.patch('/:id/cancel', mongoIdValidation('id'), handleValidationErrors, cancelBooking);

// Hotel owner and admin routes
router.get('/', authorize('hotel_owner', 'admin'), getBookings);
router.patch('/:id/status',
  authorize('hotel_owner', 'admin'),
  mongoIdValidation('id'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Invalid booking status')
  ],
  handleValidationErrors,
  updateBookingStatus
);

export default router;