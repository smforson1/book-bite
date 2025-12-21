import express from 'express';
import { toggleFavorite, getUserFavorites, checkFavorite } from '../controllers/favoriteController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.post('/toggle', verifyToken, toggleFavorite);
router.get('/user', verifyToken, getUserFavorites);
router.get('/check/:businessId', verifyToken, checkFavorite);

export default router;
