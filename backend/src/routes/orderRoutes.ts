import express from 'express';
import { createOrder, getUserOrders, updateOrderStatus } from '../controllers/orderController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

router.post('/', createOrder);
router.get('/user', getUserOrders);
router.put('/:id', updateOrderStatus);

export default router;
