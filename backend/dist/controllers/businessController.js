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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinesses = exports.getBusinessById = exports.updateBusiness = exports.getMyBusiness = exports.createBusiness = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create Business
const createBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, description, address, images } = req.body;
        const userId = req.user.userId;
        // Get manager profile
        const managerProfile = yield prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true },
        });
        if (!managerProfile) {
            res.status(404).json({ message: 'Manager profile not found' });
            return;
        }
        if (managerProfile.business) {
            res.status(400).json({ message: 'Business already exists for this manager' });
            return;
        }
        const business = yield prisma.business.create({
            data: {
                managerId: managerProfile.id,
                name,
                type,
                description,
                address,
                images: images || [],
            },
        });
        res.status(201).json(business);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating business', error });
    }
});
exports.createBusiness = createBusiness;
// Get Manager's Business
const getMyBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const managerProfile = yield prisma.managerProfile.findUnique({
            where: { userId },
            include: {
                business: {
                    include: {
                        rooms: true,
                        menuCategories: {
                            include: { items: true },
                        },
                    },
                },
            },
        });
        if (!managerProfile) {
            res.status(404).json({ message: 'Manager profile not found' });
            return;
        }
        res.status(200).json(managerProfile.business);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching business', error });
    }
});
exports.getMyBusiness = getMyBusiness;
// Update Business
const updateBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name, description, address, images } = req.body;
        const userId = req.user.userId;
        // Verify ownership
        const managerProfile = yield prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true },
        });
        if (!managerProfile || ((_a = managerProfile.business) === null || _a === void 0 ? void 0 : _a.id) !== id) {
            res.status(403).json({ message: 'Not authorized to update this business' });
            return;
        }
        const business = yield prisma.business.update({
            where: { id },
            data: {
                name,
                description,
                address,
                images,
            },
        });
        res.status(200).json(business);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating business', error });
    }
});
exports.updateBusiness = updateBusiness;
// Get Business by ID (Public)
const getBusinessById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const business = yield prisma.business.findUnique({
            where: { id },
            include: {
                rooms: { where: { isAvailable: true } },
                menuCategories: {
                    include: {
                        items: { where: { isAvailable: true } },
                    },
                },
                reviews: {
                    include: { user: { select: { name: true } } },
                    orderBy: { id: 'desc' },
                    take: 10,
                },
            },
        });
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        res.status(200).json(business);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching business', error });
    }
});
exports.getBusinessById = getBusinessById;
// Get All Businesses (with filters)
const getBusinesses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, search } = req.query;
        const where = {};
        if (type)
            where.type = type;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const businesses = yield prisma.business.findMany({
            where,
            include: {
                reviews: {
                    select: { rating: true },
                },
            },
        });
        // Calculate average rating
        const businessesWithRating = businesses.map((business) => {
            const avgRating = business.reviews.length > 0
                ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
                : 0;
            return Object.assign(Object.assign({}, business), { averageRating: avgRating });
        });
        res.status(200).json(businessesWithRating);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching businesses', error });
    }
});
exports.getBusinesses = getBusinesses;
