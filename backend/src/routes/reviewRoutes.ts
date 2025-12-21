import express from 'express';
import {
    createReview,
    getBusinessReviews,
    getUserReviews,
    updateReview,
    deleteReview
} from '../controllers/reviewController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/business/:businessId', getBusinessReviews);

// Protected routes
router.post('/', verifyToken, createReview);
router.get('/user', verifyToken, getUserReviews);
router.put('/:id', verifyToken, updateReview);
router.delete('/:id', verifyToken, deleteReview);

export default router;
