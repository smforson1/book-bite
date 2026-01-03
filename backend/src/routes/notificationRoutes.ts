import express from 'express';
import { verifyToken } from '../middleware/auth';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = express.Router();

router.use(verifyToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
