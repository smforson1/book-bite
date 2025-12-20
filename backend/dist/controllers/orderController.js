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
exports.updateOrderStatus = exports.getManagerOrders = exports.getUserOrders = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const notificationService_1 = require("../services/notificationService");
const prisma = new client_1.PrismaClient();
// Helper to reliably access pushToken even if Types confuse it
const getPushToken = (user) => user === null || user === void 0 ? void 0 : user.pushToken;
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
// ... existing imports
// Get Manager Orders
const getManagerOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Find business for this manager
        const manager = yield prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true }
        });
        if (!(manager === null || manager === void 0 ? void 0 : manager.business)) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }
        const orders = yield prisma.order.findMany({
            where: { businessId: manager.business.id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching manager orders', error });
    }
});
exports.getManagerOrders = getManagerOrders;
// Update Order Status
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const role = req.user.role; // Assuming role is available in token
        const order = yield prisma.order.findUnique({
            where: { id },
            include: {
                user: true, // For push token
                business: { include: { manager: true } } // needed? maybe for verification
            }
        });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        // Authorization Logic
        if (role === 'MANAGER') {
            // Verify order belongs to manager's business
            const manager = yield prisma.managerProfile.findUnique({ where: { userId } });
            if (((_a = order.business) === null || _a === void 0 ? void 0 : _a.managerId) !== (manager === null || manager === void 0 ? void 0 : manager.id)) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        }
        else {
            // User can only cancel
            if (order.userId !== userId) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
            if (status !== 'CANCELLED') {
                res.status(400).json({ message: 'Users can only cancel orders' });
                return;
            }
            if (order.status !== 'PENDING') {
                res.status(400).json({ message: 'Cannot cancel processed order' });
                return;
            }
        }
        const updated = yield prisma.order.update({
            where: { id },
            data: { status },
        });
        // Notify User if Manager updated it
        const pushToken = (_b = order.user) === null || _b === void 0 ? void 0 : _b.pushToken;
        if (role === 'MANAGER' && pushToken) {
            let title = 'Order Update';
            let body = `Your order is now ${status}`;
            if (status === 'KITCHEN') {
                title = 'Order Accepted! 🍳';
                body = 'Your food is being prepared in the kitchen.';
            }
            else if (status === 'DELIVERY') {
                title = 'Out for Delivery 🛵';
                body = 'Your order is on the way!';
            }
            else if (status === 'COMPLETED') {
                title = 'Order Delivered 😋';
                body = 'Enjoy your meal!';
            }
            else if (status === 'CANCELLED') {
                title = 'Order Cancelled ❌';
                body = 'Your order has been cancelled.';
            }
            yield (0, notificationService_1.sendPushNotification)(pushToken, title, body);
        }
        // Notify Manager if User updated it (Cancelled)
        if (role !== 'MANAGER' && status === 'CANCELLED') {
            // Logic to notify manager could go here, similar to paymentController
            // But for now focusing on User notifications from Manager actions
        }
        res.status(200).json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating order', error });
    }
});
exports.updateOrderStatus = updateOrderStatus;
