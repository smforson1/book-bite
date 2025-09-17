import { Router } from 'express';
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getMyHotels,
  getHotelRooms,
  getNearbyHotels
} from '@/controllers/hotelController';
import { authenticate, authorize } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { uploadLimiter, publicApiLimiter } from '@/middleware/rateLimiter';
import { uploadMultiple } from '@/middleware/upload';
import { hotelValidation, searchValidation, mongoIdValidation } from '@/utils/validation';

const router = Router();

// Public routes - with lenient rate limiting
router.get('/', publicApiLimiter, searchValidation, handleValidationErrors, getHotels);
router.get('/nearby', publicApiLimiter, searchValidation, handleValidationErrors, getNearbyHotels);
router.get('/:id', publicApiLimiter, mongoIdValidation('id'), handleValidationErrors, getHotelById);
router.get('/:hotelId/rooms', publicApiLimiter, mongoIdValidation('hotelId'), handleValidationErrors, getHotelRooms);

// Protected routes
router.use(authenticate);

// Hotel owner and admin routes
router.post('/', 
  authorize('hotel_owner', 'admin'),
  uploadLimiter,
  uploadMultiple('images', 10),
  hotelValidation,
  handleValidationErrors,
  createHotel
);

router.put('/:id',
  authorize('hotel_owner', 'admin'),
  uploadLimiter,
  uploadMultiple('images', 10),
  mongoIdValidation('id'),
  handleValidationErrors,
  updateHotel
);

router.delete('/:id',
  authorize('hotel_owner', 'admin'),
  mongoIdValidation('id'),
  handleValidationErrors,
  deleteHotel
);

router.get('/owner/my-hotels',
  authorize('hotel_owner', 'admin'),
  getMyHotels
);

export default router;