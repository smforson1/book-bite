import express from 'express';
import {
    createBusiness,
    getMyBusiness,
    updateBusiness,
    getBusinessById,
    getBusinesses,
} from '../controllers/businessController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getBusinesses);
router.get('/:id', getBusinessById);

// Protected routes - Manager only
router.post('/', verifyToken, requireRole(['MANAGER']), createBusiness);
router.get('/me/business', verifyToken, requireRole(['MANAGER']), getMyBusiness);
router.put('/:id', verifyToken, requireRole(['MANAGER']), updateBusiness);

export default router;
