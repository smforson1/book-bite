import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Generate Activation Code
export const generateActivationCode = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { price } = req.body;
        const adminId = req.user.userId;

        const code = crypto.randomBytes(8).toString('hex').toUpperCase();

        const activationCode = await prisma.activationCode.create({
            data: {
                code,
                price: parseFloat(price),
                generatedBy: adminId,
            },
        });

        res.status(201).json(activationCode);
    } catch (error) {
        res.status(500).json({ message: 'Error generating activation code', error });
    }
};

// Get All Activation Codes
export const getActivationCodes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const codes = await prisma.activationCode.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(codes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activation codes', error });
    }
};

// Get Dashboard Stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        const totalManagers = await prisma.user.count({ where: { role: 'MANAGER' } });
        const activeCodes = await prisma.activationCode.count({ where: { isUsed: false } });

        const usedCodes = await prisma.activationCode.findMany({
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
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

// Get All Users
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
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
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

// Toggle Block User
export const toggleBlockUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.role === 'ADMIN') {
            res.status(403).json({ message: 'Cannot block admins' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isBlocked: !user.isBlocked },
            select: { id: true, isBlocked: true }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling user status', error });
    }
};

// Get All Businesses
export const getBusinesses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const businesses = await prisma.business.findMany({
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
    } catch (error) {
        res.status(500).json({ message: 'Error fetching businesses', error });
    }
};

// Toggle Flag Business
export const toggleFlagBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId } = req.body;

        const business = await prisma.business.findUnique({ where: { id: businessId } });
        if (!business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const updated = await prisma.business.update({
            where: { id: businessId },
            data: { isFlagged: !business.isFlagged }
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling business status', error });
    }
};

// Get Revenue Stats
export const getRevenueStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get all used activation codes
        const usedCodes = await prisma.activationCode.findMany({
            where: { isUsed: true },
            select: { price: true, createdAt: true }
        });

        // Group by Date (YYYY-MM-DD)
        const revenueMap: Record<string, number> = {};

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
    } catch (error) {
        console.error("Error fetching revenue stats:", error);
        // Fallback if updatedAt fails (if migration didn't run)
        res.status(500).json({ message: 'Error calculating revenue stats' });
    }
};
