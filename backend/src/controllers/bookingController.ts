import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendPushNotification } from '../services/notificationService';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Booking
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomId, checkIn, checkOut, guests, roomCount = 1, bookingGender, guestName, isManual, guestUserId } = req.body;

        // If it's a manual booking by a manager, we allow setting a different (or no) userId
        let userId = req.user.userId;
        if (isManual && req.user.role === 'MANAGER') {
            userId = guestUserId || null;
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { business: true },
        });

        if (!room || !room.isAvailable) {
            res.status(400).json({ message: 'Room not available or does not exist' });
            return;
        }

        const isHostel = room.business.type === 'HOSTEL';

        // Gender Validation for Hostels
        if (isHostel && !bookingGender) {
            res.status(400).json({ message: 'Please select a gender (Male/Female) for this hostel booking.' });
            return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Inventory Check: Count overlapping bookings (sum of roomCounts)
        // For Hostels, filter by bookingGender to check specific stock
        const genderFilter = isHostel ? { bookingGender } : {};

        const overlappingBookings = await prisma.booking.findMany({
            where: {
                roomId,
                status: { not: 'CANCELLED' },
                ...genderFilter,
                // Check for date overlap: (StartA < EndB) and (EndA > StartB)
                checkIn: { lt: checkOutDate },
                checkOut: { gt: checkInDate },
            },
            select: { roomCount: true }
        });

        const activeRoomCount = overlappingBookings.reduce((sum, b) => sum + b.roomCount, 0);

        // Determine correct stock limit
        let limit = room.totalStock || 1;
        if (isHostel) {
            limit = bookingGender === 'MALE' ? (room.stockMale || 0) : (room.stockFemale || 0);
        }

        if (activeRoomCount + Number(roomCount) > limit) {
            const typeLabel = isHostel ? `${bookingGender?.toLowerCase()} bed spaces` : 'rooms';
            res.status(400).json({
                message: `Not enough ${typeLabel} available. requested: ${roomCount}, available: ${Math.max(0, limit - activeRoomCount)}`
            });
            return;
        }

        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        // Yearly Pricing for Hostels (Ignore nights)
        const totalPrice = isHostel
            ? Number(room.price) * Number(roomCount)
            : Number(room.price) * nights * Number(roomCount);

        const booking = await prisma.booking.create({
            data: {
                userId,
                businessId: room.businessId,
                roomId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests,
                roomCount: Number(roomCount),
                bookingGender: isHostel ? bookingGender : null,
                guestName,
                totalPrice,
                status: (isManual && req.body.status) ? req.body.status : 'PENDING',
                paidAmount: (isManual && req.body.paidAmount) ? parseFloat(req.body.paidAmount) : 0,
            },
            include: {
                room: true,
                business: true,
            },
        });

        // 6. Create Notification for Manager
        // We already fetched room with business, but we need the manager's userId.
        // Let's optimize by fetching it early or doing a separate query.
        const businessParams = await prisma.business.findUnique({
            where: { id: room.businessId },
            include: { manager: true }
        });

        if (!isManual && businessParams?.manager?.userId) {
            await prisma.notification.create({
                data: {
                    userId: businessParams.manager.userId,
                    title: 'New Booking Received',
                    body: `New booking for ${room.name} (${Number(roomCount)} bed${Number(roomCount) > 1 ? 's' : ''}). check dashboard.`,
                    data: { bookingId: booking.id, type: 'BOOKING' }
                }
            });
        }

        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking Error", error);
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
        const role = req.user.role;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { business: true }
        });

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        // Permission Check: Owner or Manager of the business
        if (role !== 'MANAGER' && booking.userId !== userId) {
            // For non-managers, they can only update their own bookings
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        // If manager, verify it's THEIR business (optional but safer)
        if (role === 'MANAGER') {
            const manager = await prisma.managerProfile.findUnique({
                where: { userId },
                include: { business: true }
            });
            if (!manager || manager.business?.id !== booking.businessId) {
                res.status(403).json({ message: 'Unauthorized' });
                return;
            }
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
                payments: true
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching manager bookings', error });
    }
};
// Get Occupancy Stats for Manager Dashboard
export const getOccupancyStats = async (req: AuthRequest, res: Response): Promise<void> => {
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

        const businessId = manager.business.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // 1. Check-ins Today
        const checkInsToday = await prisma.booking.count({
            where: {
                businessId,
                status: 'CONFIRMED',
                checkIn: { gte: today, lt: tomorrow }
            }
        });

        // 2. Check-outs Today
        const checkOutsToday = await prisma.booking.count({
            where: {
                businessId,
                status: 'CONFIRMED',
                checkOut: { gte: today, lt: tomorrow }
            }
        });

        // 3. Current Active Guests
        const activeBookings = await prisma.booking.findMany({
            where: {
                businessId,
                status: 'CONFIRMED',
                checkIn: { lte: new Date() },
                checkOut: { gt: new Date() }
            },
            select: { guests: true, roomCount: true }
        });

        const activeGuests = activeBookings.reduce((sum, b) => sum + b.guests, 0);
        const occupiedUnits = activeBookings.reduce((sum, b) => sum + b.roomCount, 0);

        res.status(200).json({
            checkInsToday,
            checkOutsToday,
            activeGuests,
            occupiedUnits
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching occupancy stats', error });
    }
};

// Get List of Active Guests
export const getActiveGuests = async (req: AuthRequest, res: Response): Promise<void> => {
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
            where: {
                businessId: manager.business.id,
                status: 'CONFIRMED',
                checkIn: { lte: new Date() },
                checkOut: { gt: new Date() }
            },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                room: true
            },
            orderBy: { checkOut: 'asc' }
        });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active guests', error });
    }
};
