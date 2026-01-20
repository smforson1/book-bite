import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// Sync endpoints (Protected, Manager or Admin)
router.post('/sync', verifyToken, requireRole(['ADMIN', 'MANAGER']), aiController.syncEmbeddings);

// Search endpoint (Public)
router.get('/search', aiController.semanticSearch);

// BiteBot Chat endpoint (Protected)
router.post('/chat', verifyToken, aiController.chat);

// Sentiment Analysis (Protected, Manager or Admin)
router.get('/sentiment/:businessId', verifyToken, requireRole(['ADMIN', 'MANAGER']), aiController.analyzeReviews);

// Content Generation (Protected, Manager or Admin)
router.post('/generate-content', verifyToken, requireRole(['ADMIN', 'MANAGER']), aiController.generateContent);

// Vision Search (Public)
router.post('/vision-search', aiController.visionSearch);

export default router;
