"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const walletController_1 = require("../controllers/walletController");
const router = express_1.default.Router();
// Manager Routes
router.get('/', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), walletController_1.getWallet);
router.post('/payout', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), walletController_1.requestPayout);
// Admin Routes
router.get('/admin/payouts', auth_1.verifyToken, (0, auth_1.requireRole)(['ADMIN']), walletController_1.getAdminPayouts);
router.put('/admin/payouts/:id', auth_1.verifyToken, (0, auth_1.requireRole)(['ADMIN']), walletController_1.processPayout);
exports.default = router;
