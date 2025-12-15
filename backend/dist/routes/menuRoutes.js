"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menuController_1 = require("../controllers/menuController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/business/:businessId', menuController_1.getMenuItemsByBusiness);
// Protected routes - Manager only
router.post('/categories', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), menuController_1.createMenuCategory);
router.post('/', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), menuController_1.createMenuItem);
router.put('/:id', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), menuController_1.updateMenuItem);
router.delete('/:id', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), menuController_1.deleteMenuItem);
exports.default = router;
