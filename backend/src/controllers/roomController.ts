import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Room
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId, name, description, price, capacity, amenities, images } = req.body;
        const userId = req.user.userId;

        // Verify business ownership
        const business = await prisma.business.findFirst({
            where: {
                id: businessId,
                manager: { userId },
            },
        });

        if (!business) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const room = await prisma.room.create({
            data: {
                businessId,
                name,
                description,
                price: parseFloat(price),
                capacity,
                amenities: amenities || [],
                images: images || [],
            },
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error creating room', error });
    }
};

// Get Rooms by Business
export const getRoomsByBusiness = async (req: Request, res: Response): Promise<void> => {
    try {
        const { businessId } = req.params;

        const rooms = await prisma.room.findMany({
            where: { businessId },
        });

        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error });
    }
};

// Update Room
export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price, capacity, amenities, images, isAvailable } = req.body;
        const userId = req.user.userId;

        // Verify ownership
        const room = await prisma.room.findFirst({
            where: {
                id,
                business: { manager: { userId } },
            },
        });

        if (!room) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const updated = await prisma.room.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                capacity,
                amenities,
                images,
                isAvailable,
            },
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating room', error });
    }
};

// Delete Room
export const deleteRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Verify ownership
        const room = await prisma.room.findFirst({
            where: {
                id,
                business: { manager: { userId } },
            },
        });

        if (!room) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        await prisma.room.delete({ where: { id } });
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting room', error });
    }
};
