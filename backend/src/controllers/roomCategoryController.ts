import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Room Category
export const createRoomCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId, name } = req.body;
        const userId = req.user.userId;

        // Verify business ownership and type (Hotels only as per request)
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                manager: { userId },
                type: 'HOTEL',
            },
        });

        if (!business) {
            res.status(403).json({ message: 'Not authorized or business is not a Hotel' });
            return;
        }

        const category = await prisma.roomCategory.create({
            data: {
                businessId,
                name,
            },
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating room category', error });
    }
};

// Get Room Categories by Business
export const getRoomCategoriesByBusiness = async (req: Request, res: Response): Promise<void> => {
    try {
        const { businessId } = req.params;

        const categories = await prisma.roomCategory.findMany({
            where: { businessId },
            include: {
                rooms: true,
            },
        });

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room categories', error });
    }
};

// Update Room Category
export const updateRoomCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;

        const category = await prisma.roomCategory.findFirst({
            where: {
                id,
                business: { manager: { userId } },
            },
        });

        if (!category) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const updated = await prisma.roomCategory.update({
            where: { id },
            data: { name },
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating room category', error });
    }
};

// Delete Room Category
export const deleteRoomCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const category = await prisma.roomCategory.findFirst({
            where: {
                id,
                business: { manager: { userId } },
            },
        });

        if (!category) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        // Optional: decide what happens to rooms. 
        // For now, rooms will just have categoryId set to null (standard prisma behavior if we don't cascades)
        // Actually, we should probably check if there are rooms.

        await prisma.roomCategory.delete({
            where: { id },
        });

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting room category', error });
    }
};
