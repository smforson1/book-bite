import express from 'express';
import { verifyPayment, initializePayment } from '../controllers/paymentController';

const router = express.Router();

router.post('/initialize', initializePayment);
router.post('/verify', verifyPayment);

export default router;
