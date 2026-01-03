import express from 'express';
import {
    createRoomCategory,
    getRoomCategoriesByBusiness,
    updateRoomCategory,
    deleteRoomCategory
} from '../controllers/roomCategoryController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/business/:businessId', getRoomCategoriesByBusiness);

router.use(verifyToken);
router.use(requireRole(['MANAGER']));

router.post('/', createRoomCategory);
router.put('/:id', updateRoomCategory);
router.delete('/:id', deleteRoomCategory);

export default router;
