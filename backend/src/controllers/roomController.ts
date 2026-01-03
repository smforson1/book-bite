import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Room
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId, categoryId, name, description, price, capacity, amenities, images, totalStock, stockMale, stockFemale } = req.body;
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

        // Calculate total stock if split stock is provided
        const calculatedTotal = (stockMale || 0) + (stockFemale || 0);
        const finalTotal = calculatedTotal > 0 ? calculatedTotal : (totalStock ? parseInt(totalStock) : 1);

        const room = await prisma.room.create({
            data: {
                businessId,
                categoryId,
                name,
                description,
                price: parseFloat(price),
                capacity,
                totalStock: finalTotal,
                stockMale: stockMale ? parseInt(stockMale) : 0,
                stockFemale: stockFemale ? parseInt(stockFemale) : 0,
                amenities: amenities || [],
                images: images || [],
            },
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error creating room', error });
    }
};

// Get Rooms by Business with Dynamic Availability
export const getRoomsByBusiness = async (req: Request, res: Response): Promise<void> => {
    try {
        const { businessId } = req.params;

        const rooms = await prisma.room.findMany({
            where: { businessId },
            include: {
                bookings: {
                    where: {
                        status: { not: 'CANCELLED' },
                        checkOut: { gt: new Date() }, // Only active/future bookings affect inventory
                    }
                }
            }
        });

        const roomsWithAvailability = rooms.map(room => {
            const isHostel = room.stockMale > 0 || room.stockFemale > 0; // Heuristic or check business type if fetched

            let activeMale = 0;
            let activeFemale = 0;
            let activeTotal = 0;

            room.bookings.forEach(b => {
                const count = b.roomCount || 1;
                activeTotal += count;
                if (b.bookingGender === 'MALE') activeMale += count;
                if (b.bookingGender === 'FEMALE') activeFemale += count;
            });

            // Calculate "Left"
            // Ensure we don't go below 0 visually
            const availableTotal = Math.max(0, (room.totalStock || 1) - activeTotal);
            const availableMale = Math.max(0, (room.stockMale || 0) - activeMale);
            const availableFemale = Math.max(0, (room.stockFemale || 0) - activeFemale);

            // Hide bookings from response to keep it light
            const { bookings, ...roomData } = room;

            return {
                ...roomData,
                availableStock: availableTotal,
                availableMale: availableMale,
                availableFemale: availableFemale,
            };
        });

        res.status(200).json(roomsWithAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error });
    }
};

// Update Room
export const updateRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { categoryId, name, description, price, capacity, amenities, images, isAvailable, totalStock, stockMale, stockFemale } = req.body;
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

        const data: any = {
            categoryId,
            name,
            description,
            price: price ? parseFloat(price) : undefined,
            capacity,
            amenities,
            images,
            isAvailable,
        };

        // Handle stock updates
        if (stockMale !== undefined) data.stockMale = parseInt(stockMale);
        if (stockFemale !== undefined) data.stockFemale = parseInt(stockFemale);

        // If updating specific stocks, update total too
        if (stockMale !== undefined || stockFemale !== undefined) {
            const m = stockMale !== undefined ? parseInt(stockMale) : room.stockMale;
            const f = stockFemale !== undefined ? parseInt(stockFemale) : room.stockFemale;
            data.totalStock = m + f;
        } else if (totalStock !== undefined) {
            data.totalStock = parseInt(totalStock);
        }

        const updated = await prisma.room.update({
            where: { id },
            data,
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
