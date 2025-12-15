import express from 'express';
import { register, login, registerManager } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-manager', registerManager);

export default router;
