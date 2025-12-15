import express from 'express';
import {
    createRoom,
    getRoomsByBusiness,
    updateRoom,
    deleteRoom,
} from '../controllers/roomController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/business/:businessId', getRoomsByBusiness);

// Protected routes - Manager only
router.post('/', verifyToken, requireRole(['MANAGER']), createRoom);
router.put('/:id', verifyToken, requireRole(['MANAGER']), updateRoom);
router.delete('/:id', verifyToken, requireRole(['MANAGER']), deleteRoom);

export default router;
