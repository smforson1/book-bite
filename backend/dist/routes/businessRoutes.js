"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const businessController_1 = require("../controllers/businessController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', businessController_1.getBusinesses);
router.get('/:id', businessController_1.getBusinessById);
// Protected routes - Manager only
router.post('/', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), businessController_1.createBusiness);
router.get('/me/business', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), businessController_1.getMyBusiness);
router.put('/:id', auth_1.verifyToken, (0, auth_1.requireRole)(['MANAGER']), businessController_1.updateBusiness);
exports.default = router;
