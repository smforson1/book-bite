import express from 'express';
import { verifyToken } from '../middleware/auth';
import { updatePushToken } from '../controllers/userController';

const router = express.Router();

router.put('/push-token', verifyToken, updatePushToken);

export default router;
