import { Router } from 'express';
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
  getRestaurantMenu,
  getNearbyRestaurants
} from '@/controllers/restaurantController';
import { authenticate, authorize } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { uploadLimiter, publicApiLimiter } from '@/middleware/rateLimiter';
import { uploadMultiple } from '@/middleware/upload';
import { restaurantValidation, searchValidation, mongoIdValidation } from '@/utils/validation';

const router = Router();

// Public routes - with lenient rate limiting
router.get('/', publicApiLimiter, searchValidation, handleValidationErrors, getRestaurants);
router.get('/nearby', publicApiLimiter, searchValidation, handleValidationErrors, getNearbyRestaurants);
router.get('/:id', publicApiLimiter, mongoIdValidation('id'), handleValidationErrors, getRestaurantById);
router.get('/:restaurantId/menu', publicApiLimiter, mongoIdValidation('restaurantId'), handleValidationErrors, getRestaurantMenu);

// Protected routes
router.use(authenticate);

// Restaurant owner and admin routes
router.post('/', 
  authorize(['restaurant_owner', 'admin']),
  uploadLimiter,
  uploadMultiple('images', 10),
  restaurantValidation,
  handleValidationErrors,
  createRestaurant
);

router.put('/:id',
  authorize(['restaurant_owner', 'admin']),
  uploadLimiter,
  uploadMultiple('images', 10),
  mongoIdValidation('id'),
  handleValidationErrors,
  updateRestaurant
);

router.delete('/:id',
  authorize(['restaurant_owner', 'admin']),
  mongoIdValidation('id'),
  handleValidationErrors,
  deleteRestaurant
);

router.get('/owner/my-restaurants',
  authorize(['restaurant_owner', 'admin']),
  getMyRestaurants
);

export default router;