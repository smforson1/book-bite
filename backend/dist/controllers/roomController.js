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
exports.deleteRoom = exports.updateRoom = exports.getRoomsByBusiness = exports.createRoom = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create Room
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId, name, description, price, capacity, amenities, images } = req.body;
        const userId = req.user.userId;
        // Verify business ownership
        const business = yield prisma.business.findFirst({
            where: {
                id: businessId,
                manager: { userId },
            },
        });
        if (!business) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const room = yield prisma.room.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating room', error });
    }
});
exports.createRoom = createRoom;
// Get Rooms by Business
const getRoomsByBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId } = req.params;
        const rooms = yield prisma.room.findMany({
            where: { businessId },
        });
        res.status(200).json(rooms);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error });
    }
});
exports.getRoomsByBusiness = getRoomsByBusiness;
// Update Room
const updateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, price, capacity, amenities, images, isAvailable } = req.body;
        const userId = req.user.userId;
        // Verify ownership
        const room = yield prisma.room.findFirst({
            where: {
                id,
                business: { manager: { userId } },
            },
        });
        if (!room) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const updated = yield prisma.room.update({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating room', error });
    }
});
exports.updateRoom = updateRoom;
// Delete Room
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        // Verify ownership
        const room = yield prisma.room.findFirst({
            where: {
                id,
                business: { manager: { userId } },
            },
        });
        if (!room) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        yield prisma.room.delete({ where: { id } });
        res.status(200).json({ message: 'Room deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting room', error });
    }
});
exports.deleteRoom = deleteRoom;
