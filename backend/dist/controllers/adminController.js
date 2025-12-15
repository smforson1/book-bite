"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenueStats = exports.toggleFlagBusiness = exports.getBusinesses = exports.toggleBlockUser = exports.getUsers = exports.getDashboardStats = exports.getActivationCodes = exports.generateActivationCode = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
// Generate Activation Code
const generateActivationCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { price } = req.body;
        const adminId = req.user.userId;
        const code = crypto_1.default.randomBytes(8).toString('hex').toUpperCase();
        const activationCode = yield prisma.activationCode.create({
            data: {
                code,
                price: parseFloat(price),
                generatedBy: adminId,
            },
        });
        res.status(201).json(activationCode);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating activation code', error });
    }
});
exports.generateActivationCode = generateActivationCode;
// Get All Activation Codes
const getActivationCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const codes = yield prisma.activationCode.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(codes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching activation codes', error });
    }
});
exports.getActivationCodes = getActivationCodes;
// Get Dashboard Stats
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield prisma.user.count({ where: { role: 'USER' } });
        const totalManagers = yield prisma.user.count({ where: { role: 'MANAGER' } });
        const activeCodes = yield prisma.activationCode.count({ where: { isUsed: false } });
        const usedCodes = yield prisma.activationCode.findMany({
            where: { isUsed: true },
            select: { price: true }
        });
        const totalRevenue = usedCodes.reduce((sum, code) => sum + Number(code.price), 0);
        res.status(200).json({
            totalUsers,
            totalManagers,
            activeCodes,
            totalRevenue,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
});
exports.getDashboardStats = getDashboardStats;
// Get All Users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBlocked: true,
                createdAt: true,
                _count: {
                    select: { bookings: true, orders: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});
exports.getUsers = getUsers;
// Toggle Block User
const toggleBlockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.role === 'ADMIN') {
            res.status(403).json({ message: 'Cannot block admins' });
            return;
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { isBlocked: !user.isBlocked },
            select: { id: true, isBlocked: true }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling user status', error });
    }
});
exports.toggleBlockUser = toggleBlockUser;
// Get All Businesses
const getBusinesses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const businesses = yield prisma.business.findMany({
            include: {
                manager: {
                    include: { user: { select: { name: true, email: true } } }
                },
                _count: {
                    select: { bookings: true, orders: true, rooms: true }
                }
            }
        });
        res.status(200).json(businesses);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching businesses', error });
    }
});
exports.getBusinesses = getBusinesses;
// Toggle Flag Business
const toggleFlagBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId } = req.body;
        const business = yield prisma.business.findUnique({ where: { id: businessId } });
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        const updated = yield prisma.business.update({
            where: { id: businessId },
            data: { isFlagged: !business.isFlagged }
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Error toggling business status', error });
    }
});
exports.toggleFlagBusiness = toggleFlagBusiness;
// Get Revenue Stats
const getRevenueStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all used activation codes
        const usedCodes = yield prisma.activationCode.findMany({
            where: { isUsed: true },
            select: { price: true, createdAt: true }
        });
        // Group by Date (YYYY-MM-DD)
        const revenueMap = {};
        usedCodes.forEach(code => {
            const date = new Date(code.createdAt).toISOString().split('T')[0];
            revenueMap[date] = (revenueMap[date] || 0) + Number(code.price);
        });
        // Convert to array and sort
        const chartData = Object.entries(revenueMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Fill in missing dates (optional: last 7 days) if needed, 
        // but for now returning actual data points is fine.
        res.status(200).json(chartData);
    }
    catch (error) {
        console.error("Error fetching revenue stats:", error);
        // Fallback if updatedAt fails (if migration didn't run)
        res.status(500).json({ message: 'Error calculating revenue stats' });
    }
});
exports.getRevenueStats = getRevenueStats;
