import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
} from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { handleValidationErrors } from '@/middleware/validation';
import { authLimiter } from '@/middleware/rateLimiter';
import {
  registerValidation,
  loginValidation,
  emailValidation,
  passwordValidation
} from '@/utils/validation';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.post('/register', authLimiter, registerValidation, handleValidationErrors, register);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, login);
router.post('/refresh', authLimiter, [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
], handleValidationErrors, refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^(\+233|0)[2-9]\d{8}$/)
    .withMessage('Please provide a valid Ghanaian phone number')
], handleValidationErrors, updateProfile);

router.put('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], handleValidationErrors, changePassword);

export default router;