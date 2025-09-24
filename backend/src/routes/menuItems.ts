import { Router } from 'express';
import {
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getMyMenuItems,
  updateMenuItemAvailability
} from '@/controllers/menuItemController';
import { authenticate, authorize } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { uploadLimiter } from '@/middleware/rateLimiter';
import { uploadMultiple } from '@/middleware/upload';
import { menuItemValidation, mongoIdValidation } from '@/utils/validation';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.get('/:id', mongoIdValidation('id'), handleValidationErrors, getMenuItemById);

// Protected routes
router.use(authenticate);

// Restaurant owner and admin routes
router.post('/',
  authorize(['restaurant_owner', 'admin']),
  uploadLimiter,
  uploadMultiple('images', 5),
  [
    body('restaurantId')
      .isMongoId()
      .withMessage('Invalid restaurant ID'),
    ...menuItemValidation
  ],
  handleValidationErrors,
  createMenuItem
);

router.put('/:id',
  authorize(['restaurant_owner', 'admin']),
  uploadLimiter,
  uploadMultiple('images', 5),
  mongoIdValidation('id'),
  handleValidationErrors,
  updateMenuItem
);

router.delete('/:id',
  authorize(['restaurant_owner', 'admin']),
  mongoIdValidation('id'),
  handleValidationErrors,
  deleteMenuItem
);

router.get('/owner/my-items',
  authorize(['restaurant_owner', 'admin']),
  getMyMenuItems
);

router.patch('/:id/availability',
  authorize(['restaurant_owner', 'admin']),
  mongoIdValidation('id'),
  [
    body('isAvailable')
      .isBoolean()
      .withMessage('isAvailable must be a boolean')
  ],
  handleValidationErrors,
  updateMenuItemAvailability
);

export default router;