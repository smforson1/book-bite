import express from 'express';
import {
    createMenuItem,
    getMenuItemsByBusiness,
    createMenuCategory,
    updateMenuItem,
    deleteMenuItem,
} from '../controllers/menuController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/business/:businessId', getMenuItemsByBusiness);

// Protected routes - Manager only
router.post('/categories', verifyToken, requireRole(['MANAGER']), createMenuCategory);
router.post('/', verifyToken, requireRole(['MANAGER']), createMenuItem);
router.put('/:id', verifyToken, requireRole(['MANAGER']), updateMenuItem);
router.delete('/:id', verifyToken, requireRole(['MANAGER']), deleteMenuItem);

export default router;
