import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
    user: { userId: string; role: string };
}

const prisma = new PrismaClient();

// Get Manager Stats
export const getManagerStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        // Get manager's business
        const manager = await prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true },
        });

        if (!manager || !manager.business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const businessId = manager.business.id;

        // Get stats
        const [bookings, orders, payments] = await Promise.all([
            prisma.booking.findMany({
                where: { businessId },
                select: { totalPrice: true, status: true },
            }),
            prisma.order.findMany({
                where: { businessId },
                select: { totalPrice: true, status: true },
            }),
            prisma.payment.findMany({
                where: {
                    OR: [
                        { booking: { businessId } },
                        { order: { businessId } },
                    ],
                    status: 'SUCCESS',
                },
                select: { amount: true },
            }),
        ]);

        // Calculate totals
        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

        res.status(200).json({
            totalRevenue,
            totalBookings,
            confirmedBookings,
            totalOrders,
            completedOrders,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching manager stats', error });
    }
};

// Get Admin Stats
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [users, businesses, payments, bookings, orders] = await Promise.all([
            prisma.user.count(),
            prisma.business.count(),
            prisma.payment.findMany({
                where: { status: 'SUCCESS' },
                select: { amount: true },
            }),
            prisma.booking.count(),
            prisma.order.count(),
        ]);

        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        res.status(200).json({
            totalUsers: users,
            totalBusinesses: businesses,
            totalRevenue,
            totalBookings: bookings,
            totalOrders: orders,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin stats', error });
    }
};
