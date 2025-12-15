import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Business
export const createBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, type, description, address, images } = req.body;
        const userId = req.user.userId;

        // Get manager profile
        const managerProfile = await prisma.managerProfile.findUnique({
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

        const business = await prisma.business.create({
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
    } catch (error) {
        res.status(500).json({ message: 'Error creating business', error });
    }
};

// Get Manager's Business
export const getMyBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        const managerProfile = await prisma.managerProfile.findUnique({
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
    } catch (error) {
        res.status(500).json({ message: 'Error fetching business', error });
    }
};

// Update Business
export const updateBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, address, images } = req.body;
        const userId = req.user.userId;

        // Verify ownership
        const managerProfile = await prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true },
        });

        if (!managerProfile || managerProfile.business?.id !== id) {
            res.status(403).json({ message: 'Not authorized to update this business' });
            return;
        }

        const business = await prisma.business.update({
            where: { id },
            data: {
                name,
                description,
                address,
                images,
            },
        });

        res.status(200).json(business);
    } catch (error) {
        res.status(500).json({ message: 'Error updating business', error });
    }
};

// Get Business by ID (Public)
export const getBusinessById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const business = await prisma.business.findUnique({
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
    } catch (error) {
        res.status(500).json({ message: 'Error fetching business', error });
    }
};

// Get All Businesses (with filters)
export const getBusinesses = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, search } = req.query;

        const where: any = {};
        if (type) where.type = type;
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const businesses = await prisma.business.findMany({
            where,
            include: {
                reviews: {
                    select: { rating: true },
                },
            },
        });

        // Calculate average rating
        const businessesWithRating = businesses.map((business) => {
            const avgRating =
                business.reviews.length > 0
                    ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
                    : 0;
            return { ...business, averageRating: avgRating };
        });

        res.status(200).json(businessesWithRating);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching businesses', error });
    }
};
