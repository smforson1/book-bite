import express from 'express';
import { createOrder, getUserOrders, updateOrderStatus, getManagerOrders } from '../controllers/orderController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

router.post('/', createOrder);
router.get('/user', getUserOrders);
router.get('/manager', requireRole(['MANAGER']), getManagerOrders);
router.put('/:id', updateOrderStatus);

export default router;
