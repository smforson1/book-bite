import express from 'express';
import { generateActivationCode, getActivationCodes, getDashboardStats, getUsers, toggleBlockUser, getBusinesses, toggleFlagBusiness, getRevenueStats } from '../controllers/adminController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(verifyToken);
router.use(requireRole(['ADMIN']));

router.post('/activation-codes', generateActivationCode);
router.get('/activation-codes', getActivationCodes);
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.post('/toggle-block-user', toggleBlockUser);
router.get('/businesses', getBusinesses);
router.post('/toggle-flag-business', toggleFlagBusiness);
router.get('/revenue-stats', getRevenueStats);

export default router;
