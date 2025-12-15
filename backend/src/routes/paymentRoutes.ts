import express from 'express';
import { verifyPaymentAndGenerateCode } from '../controllers/paymentController';

const router = express.Router();

router.post('/verify', verifyPaymentAndGenerateCode);

export default router;
