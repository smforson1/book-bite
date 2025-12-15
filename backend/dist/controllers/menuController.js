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
exports.deleteMenuItem = exports.updateMenuItem = exports.createMenuCategory = exports.getMenuItemsByBusiness = exports.createMenuItem = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create Menu Item
const createMenuItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId, name, description, price, images, dietaryTags } = req.body;
        const userId = req.user.userId;
        // Verify category ownership
        const category = yield prisma.menuCategory.findFirst({
            where: {
                id: categoryId,
                business: { manager: { userId } },
            },
        });
        if (!category) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const menuItem = yield prisma.menuItem.create({
            data: {
                categoryId,
                name,
                description,
                price: parseFloat(price),
                images: images || [],
                dietaryTags: dietaryTags || [],
            },
        });
        res.status(201).json(menuItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error });
    }
});
exports.createMenuItem = createMenuItem;
// Get Menu Items by Business
const getMenuItemsByBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId } = req.params;
        const categories = yield prisma.menuCategory.findMany({
            where: { businessId },
            include: {
                items: true,
            },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error });
    }
});
exports.getMenuItemsByBusiness = getMenuItemsByBusiness;
// Create Menu Category
const createMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId, name } = req.body;
        const userId = req.user.userId;
        // Verify business ownership
        const business = yield prisma.business.findFirst({
            where: {
                id: businessId,
                manager: { userId },
            },
        });
        if (!business) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const category = yield prisma.menuCategory.create({
            data: { businessId, name },
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
});
exports.createMenuCategory = createMenuCategory;
// Update Menu Item
const updateMenuItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, price, images, dietaryTags, isAvailable } = req.body;
        const userId = req.user.userId;
        // Verify ownership
        const menuItem = yield prisma.menuItem.findFirst({
            where: {
                id,
                category: { business: { manager: { userId } } },
            },
        });
        if (!menuItem) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const updated = yield prisma.menuItem.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                images,
                dietaryTags,
                isAvailable,
            },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
});
exports.updateMenuItem = updateMenuItem;
// Delete Menu Item
const deleteMenuItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        // Verify ownership
        const menuItem = yield prisma.menuItem.findFirst({
            where: {
                id,
                category: { business: { manager: { userId } } },
            },
        });
        if (!menuItem) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        yield prisma.menuItem.delete({ where: { id } });
        res.status(200).json({ message: 'Menu item deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error });
    }
});
exports.deleteMenuItem = deleteMenuItem;
