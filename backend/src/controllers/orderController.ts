import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

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

// Update Order Status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        const order = await prisma.order.findFirst({
            where: { id, userId },
        });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
};
