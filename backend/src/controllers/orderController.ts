import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendPushNotification } from '../services/notificationService';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any; // Contains userId, role, etc.
}

// Helper to reliably access pushToken even if Types confuse it
const getPushToken = (user: any) => user?.pushToken as string | undefined;

// Create Order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId, items, deliveryAddress, notes } = req.body;
        const userId = req.user.userId;

        // Calculate total
        let totalPrice = 0;
        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            });
            if (menuItem) {
                totalPrice += Number(menuItem.price) * item.quantity;
            }
        }

        const order = await prisma.order.create({
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
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};

// Get User Orders
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                business: true,
            },
            orderBy: { id: 'desc' },
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};



// ... existing imports

// Get Manager Orders
export const getManagerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        // Find business for this manager
        const manager = await prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true }
        });

        if (!manager?.business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const orders = await prisma.order.findMany({
            where: { businessId: manager.business.id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                payment: true
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching manager orders', error });
    }
};

// Update Order Status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const role = req.user.role; // Assuming role is available in token

        const order = await prisma.order.findUnique({
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
            const manager = await prisma.managerProfile.findUnique({ where: { userId } });
            if (order.business?.managerId !== manager?.id) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }
        } else {
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

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        });

        // Notify User if Manager updated it
        const pushToken = (order.user as any)?.pushToken;
        if (role === 'MANAGER' && pushToken) {
            let title = 'Order Update';
            let body = `Your order is now ${status}`;

            if (status === 'KITCHEN') {
                title = 'Order Accepted! 🍳';
                body = 'Your food is being prepared in the kitchen.';
            } else if (status === 'DELIVERY') {
                title = 'Out for Delivery 🛵';
                body = 'Your order is on the way!';
            } else if (status === 'COMPLETED') {
                title = 'Order Delivered 😋';
                body = 'Enjoy your meal!';
            } else if (status === 'CANCELLED') {
                title = 'Order Cancelled ❌';
                body = 'Your order has been cancelled.';
            }

            await sendPushNotification({
                userId: order.userId,
                title,
                body,
                data: { orderId: order.id, screen: 'OrderDetails' },
            });
        }

        // Notify Manager if User updated it (Cancelled)
        if (role !== 'MANAGER' && status === 'CANCELLED') {
            // Logic to notify manager could go here, similar to paymentController
            // But for now focusing on User notifications from Manager actions
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating order', error });
    }
};
