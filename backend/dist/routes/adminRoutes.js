"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All admin routes require authentication and ADMIN role
router.use(auth_1.verifyToken);
router.use((0, auth_1.requireRole)(['ADMIN']));
router.post('/activation-codes', adminController_1.generateActivationCode);
router.get('/activation-codes', adminController_1.getActivationCodes);
router.get('/stats', adminController_1.getDashboardStats);
router.get('/users', adminController_1.getUsers);
router.post('/toggle-block-user', adminController_1.toggleBlockUser);
router.get('/businesses', adminController_1.getBusinesses);
router.post('/toggle-flag-business', adminController_1.toggleFlagBusiness);
router.get('/revenue-stats', adminController_1.getRevenueStats);
exports.default = router;
