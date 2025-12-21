import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth';
import {
    updateRoomAvailability,
    updateMenuItemStock,
    getBusinessInventory,
    getLowStockItems,
} from '../controllers/inventoryController';

const router = express.Router();

// All routes require manager authentication
const managerAuth = [verifyToken, requireRole(['MANAGER'])];

// Get business inventory (rooms + menu items)
router.get('/business', ...managerAuth, getBusinessInventory);

// Get low stock items
router.get('/low-stock', ...managerAuth, getLowStockItems);

// Update room availability
router.put('/room/:roomId/availability', ...managerAuth, updateRoomAvailability);

// Update menu item stock
router.put('/menu-item/:menuItemId/stock', ...managerAuth, updateMenuItemStock);

export default router;
