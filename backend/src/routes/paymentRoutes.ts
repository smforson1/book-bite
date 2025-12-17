import express from 'express';
import { verifyPayment } from '../controllers/paymentController';

const router = express.Router();

router.post('/verify', verifyPayment);

export default router;
