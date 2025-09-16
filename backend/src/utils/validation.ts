import { body, param, query, ValidationChain } from 'express-validator';
import { GHANA_REGIONS } from '@/types';

// Common validations
export const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const phoneValidation = body('phone')
  .optional()
  .matches(/^(\+233|0)[2-9]\d{8}$/)
  .withMessage('Please provide a valid Ghanaian phone number');

export const mongoIdValidation = (field: string) => 
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`);

// User validations
export const registerValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  emailValidation,
  passwordValidation,
  body('role')
    .isIn(['user', 'hotel_owner', 'restaurant_owner'])
    .withMessage('Invalid role specified'),
  phoneValidation,
];

export const loginValidation: ValidationChain[] = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Hotel validations
export const hotelValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('phone')
    .matches(/^(\+233|0)[2-9]\d{8}$/)
    .withMessage('Please provide a valid Ghanaian phone number'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('amenities')
    .isArray()
    .withMessage('Amenities must be an array'),
  body('region')
    .isIn(GHANA_REGIONS)
    .withMessage('Invalid Ghana region'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),
];

// Room validations
export const roomValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Room name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('capacity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Capacity must be between 1 and 10'),
  body('roomNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  body('type')
    .isIn(['single', 'double', 'suite', 'deluxe'])
    .withMessage('Invalid room type'),
  body('amenities')
    .isArray()
    .withMessage('Amenities must be an array'),
];

// Restaurant validations
export const restaurantValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Restaurant name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('phone')
    .matches(/^(\+233|0)[2-9]\d{8}$/)
    .withMessage('Please provide a valid Ghanaian phone number'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('cuisine')
    .isArray()
    .withMessage('Cuisine must be an array'),
  body('deliveryTime')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Delivery time must be between 5 and 50 characters'),
  body('deliveryFee')
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),
  body('minimumOrder')
    .isFloat({ min: 0 })
    .withMessage('Minimum order must be a positive number'),
  body('region')
    .isIn(GHANA_REGIONS)
    .withMessage('Invalid Ghana region'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
];

// Menu item validations
export const menuItemValidation: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu item name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('preparationTime')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Preparation time must be between 5 and 50 characters'),
  body('ingredients')
    .isArray()
    .withMessage('Ingredients must be an array'),
  body('allergens')
    .isArray()
    .withMessage('Allergens must be an array'),
];

// Booking validations
export const bookingValidation: ValidationChain[] = [
  body('roomId')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('checkIn')
    .isISO8601()
    .toDate()
    .withMessage('Check-in date must be a valid date'),
  body('checkOut')
    .isISO8601()
    .toDate()
    .withMessage('Check-out date must be a valid date'),
  body('guests')
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of guests must be between 1 and 10'),
];

// Order validations
export const orderValidation: ValidationChain[] = [
  body('restaurantId')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.menuItemId')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
  body('deliveryAddress')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Delivery address must be between 10 and 200 characters'),
];

// Review validations
export const reviewValidation: ValidationChain[] = [
  body('targetId')
    .isMongoId()
    .withMessage('Invalid target ID'),
  body('targetType')
    .isIn(['hotel', 'restaurant'])
    .withMessage('Target type must be either hotel or restaurant'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
];

// Search validations
export const searchValidation: ValidationChain[] = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Radius must be between 0.1 and 100 km'),
];