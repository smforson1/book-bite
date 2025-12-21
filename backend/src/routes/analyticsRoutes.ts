import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth';
import { getManagerStats, getAdminStats } from '../controllers/analyticsController';

const router = express.Router();

// Manager routes
router.get('/manager/stats', verifyToken, requireRole(['MANAGER']), getManagerStats as express.RequestHandler);

// Admin routes
router.get('/admin/stats', verifyToken, requireRole(['ADMIN']), getAdminStats as express.RequestHandler);

export default router;
