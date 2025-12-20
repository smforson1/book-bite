"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All order routes require authentication
router.use(auth_1.verifyToken);
router.post('/', orderController_1.createOrder);
router.get('/user', orderController_1.getUserOrders);
router.get('/manager', (0, auth_1.requireRole)(['MANAGER']), orderController_1.getManagerOrders);
router.put('/:id', orderController_1.updateOrderStatus);
exports.default = router;
