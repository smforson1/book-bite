"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getUserBookings = exports.createBooking = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create Booking
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, checkIn, checkOut, guests } = req.body;
        const userId = req.user.userId;
        const room = yield prisma.room.findUnique({
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
        const booking = yield prisma.booking.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating booking', error });
    }
});
exports.createBooking = createBooking;
// Get User Bookings
const getUserBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const bookings = yield prisma.booking.findMany({
            where: { userId },
            include: {
                room: true,
                business: true,
            },
            orderBy: { id: 'desc' },
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});
exports.getUserBookings = getUserBookings;
// Update Booking Status
const updateBookingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const booking = yield prisma.booking.findFirst({
            where: { id, userId },
        });
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }
        const updated = yield prisma.booking.update({
            where: { id },
            data: { status },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating booking', error });
    }
});
exports.updateBookingStatus = updateBookingStatus;
