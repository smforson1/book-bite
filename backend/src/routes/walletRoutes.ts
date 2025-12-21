import express from 'express';
import { verifyToken } from '../middleware/auth';
import {
    getWallet,
    initializeTopUp,
    verifyTopUp,
    payWithWallet
} from '../controllers/walletController';

const router = express.Router();

// Get Wallet
router.get('/', verifyToken, getWallet as unknown as express.RequestHandler);

// Top Up
router.post('/top-up/initialize', verifyToken, initializeTopUp as unknown as express.RequestHandler);
router.post('/top-up/verify', verifyToken, verifyTopUp as unknown as express.RequestHandler);

// Pay with Wallet
router.post('/pay', verifyToken, payWithWallet as unknown as express.RequestHandler);

export default router;
