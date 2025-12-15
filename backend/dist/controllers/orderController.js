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
exports.updateOrderStatus = exports.getUserOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create Order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId, items, deliveryAddress, notes } = req.body;
        const userId = req.user.userId;
        // Calculate total
        let totalPrice = 0;
        for (const item of items) {
            const menuItem = yield prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            });
            if (menuItem) {
                totalPrice += Number(menuItem.price) * item.quantity;
            }
        }
        const order = yield prisma.order.create({
            data: {
                userId,
                businessId,
                items: items,
                totalPrice,
                deliveryAddress,
                notes,
                status: 'PENDING',
            },
            include: {
                business: true,
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
});
exports.createOrder = createOrder;
// Get User Orders
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const orders = yield prisma.order.findMany({
            where: { userId },
            include: {
                business: true,
            },
            orderBy: { id: 'desc' },
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});
exports.getUserOrders = getUserOrders;
// Update Order Status
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const order = yield prisma.order.findFirst({
            where: { id, userId },
        });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        const updated = yield prisma.order.update({
            where: { id },
            data: { status },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
});
exports.updateOrderStatus = updateOrderStatus;
