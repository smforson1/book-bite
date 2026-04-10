import { Router } from 'express';
import { generateLocationQR } from '../controllers/qrController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Endpoint for managers to generate QR codes for their business
router.get('/generate', verifyToken, generateLocationQR);

export default router;
