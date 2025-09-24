import { Router } from 'express';
import {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  getMyRooms,
  checkRoomAvailability,
  updateRoomAvailability
} from '@/controllers/roomController';
import { authenticate, authorize } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { uploadLimiter } from '@/middleware/rateLimiter';
import { uploadMultiple } from '@/middleware/upload';
import { roomValidation, mongoIdValidation } from '@/utils/validation';
import { body, query } from 'express-validator';

const router = Router();

// Public routes
router.get('/:id', mongoIdValidation('id'), handleValidationErrors, getRoomById);
router.get('/:id/availability', 
  mongoIdValidation('id'),
  [
    query('checkIn')
      .isISO8601()
      .toDate()
      .withMessage('Check-in date must be a valid date'),
    query('checkOut')
      .isISO8601()
      .toDate()
      .withMessage('Check-out date must be a valid date')
  ],
  handleValidationErrors,
  checkRoomAvailability
);

// Protected routes
router.use(authenticate);

// Hotel owner and admin routes
router.post('/',
  authorize(['hotel_owner', 'admin']),
  uploadLimiter,
  uploadMultiple('images', 5),
  [
    body('hotelId')
      .isMongoId()
      .withMessage('Invalid hotel ID'),
    ...roomValidation
  ],
  handleValidationErrors,
  createRoom
);

router.put('/:id',
  authorize(['hotel_owner', 'admin']),
  uploadLimiter,
  uploadMultiple('images', 5),
  mongoIdValidation('id'),
  handleValidationErrors,
  updateRoom
);

router.delete('/:id',
  authorize(['hotel_owner', 'admin']),
  mongoIdValidation('id'),
  handleValidationErrors,
  deleteRoom
);

router.get('/owner/my-rooms',
  authorize(['hotel_owner', 'admin']),
  getMyRooms
);

router.patch('/:id/availability',
  authorize(['hotel_owner', 'admin']),
  mongoIdValidation('id'),
  [
    body('isAvailable')
      .isBoolean()
      .withMessage('isAvailable must be a boolean')
  ],
  handleValidationErrors,
  updateRoomAvailability
);

export default router;