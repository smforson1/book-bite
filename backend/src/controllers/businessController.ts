import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Business
export const createBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, type, description, address, latitude, longitude, images } = req.body;
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
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
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
        const { name, description, address, latitude, longitude, images } = req.body;
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
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
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
        const { type, search, userLat, userLng } = req.query;

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

        // Calculate average rating and distance
        const businessesWithRating = businesses.map((business) => {
            const avgRating =
                business.reviews.length > 0
                    ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
                    : 0;

            let distance = null;
            if (userLat && userLng && business.latitude !== null && business.longitude !== null) {
                const lat1 = parseFloat(userLat as string);
                const lon1 = parseFloat(userLng as string);

                if (!isNaN(lat1) && !isNaN(lon1)) {
                    const lat2 = business.latitude;
                    const lon2 = business.longitude;

                    // Haversine formula
                    const R = 6371; // km
                    const dLat = (lat2 - lat1) * Math.PI / 180;
                    const dLon = (lon2 - lon1) * Math.PI / 180;
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    distance = R * c;
                }
            }

            return { ...business, averageRating: avgRating, distance };
        });

        // Sort by distance if provided
        if (userLat && userLng) {
            businessesWithRating.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

        res.status(200).json(businessesWithRating);
    } catch (error) {
        console.error('getBusinesses Error:', error);
        res.status(500).json({ message: 'Error fetching businesses', error });
    }
};
