import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth';
import { getWallet, requestPayout, getAdminPayouts, processPayout } from '../controllers/walletController';

const router = express.Router();

// Manager Routes
router.get('/', verifyToken, requireRole(['MANAGER']), getWallet);
router.post('/payout', verifyToken, requireRole(['MANAGER']), requestPayout);

// Admin Routes
router.get('/admin/payouts', verifyToken, requireRole(['ADMIN']), getAdminPayouts);
router.put('/admin/payouts/:id', verifyToken, requireRole(['ADMIN']), processPayout);

export default router;
