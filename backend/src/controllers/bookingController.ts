import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Booking
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomId, checkIn, checkOut, guests } = req.body;
        const userId = req.user.userId;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { business: true },
        });

        if (!room || !room.isAvailable) {
            res.status(400).json({ message: 'Room not available' });
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const booking = await prisma.booking.create({
            data: {
                userId,
                businessId: room.businessId,
                roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests,
                totalPrice: Number(room.price) * nights, // Correct calculation
                status: 'PENDING',
            },
            include: {
                room: true,
                business: true,
            },
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error });
    }
};

// Get User Bookings
export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                room: true,
                business: true,
            },
            orderBy: { id: 'desc' },
        });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
};

// Update Booking Status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        const booking = await prisma.booking.findFirst({
            where: { id, userId },
        });

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: { status },
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking', error });
    }
};

// Get Manager Bookings
export const getManagerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        const manager = await prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true }
        });

        if (!manager?.business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const bookings = await prisma.booking.findMany({
            where: { businessId: manager.business.id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                room: true,
                payment: true
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching manager bookings', error });
    }
};
