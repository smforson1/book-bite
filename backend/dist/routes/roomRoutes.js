"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomController_1 = require("../controllers/roomController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/business/:businessId', roomController_1.getRoomsByBusiness);
// Protected routes - Manager only
router.post('/', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), roomController_1.createRoom);
router.put('/:id', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), roomController_1.updateRoom);
router.delete('/:id', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), roomController_1.deleteRoom);
exports.default = router;
