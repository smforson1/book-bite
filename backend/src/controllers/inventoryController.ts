import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
    user: { userId: string; role: string };
}

const prisma = new PrismaClient();

// Update Room Availability
export const updateRoomAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;
        const { isAvailable } = req.body;
        const userId = req.user.userId;

        // Verify manager owns this room's business
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { business: { include: { manager: true } } },
        });

        if (!room || room.business.manager?.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: { isAvailable },
        });

        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ message: 'Error updating room availability', error });
    }
};

// Update Menu Item Stock
export const updateMenuItemStock = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { menuItemId } = req.params;
        const { stock } = req.body;
        const userId = req.user.userId;

        // Verify manager owns this menu item's business
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: menuItemId },
            include: { category: { include: { business: { include: { manager: true } } } } },
        });

        if (!menuItem || menuItem.category.business.manager?.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        // Update stock
        const updatedMenuItem = await prisma.menuItem.update({
            where: { id: menuItemId },
            data: { stock },
        });

        res.status(200).json(updatedMenuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item stock', error });
    }
};

// Get Inventory for Manager's Business
export const getBusinessInventory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        // Get manager's business
        const manager = await prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true },
        });

        if (!manager || !manager.business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        // Get rooms and menu items
        const [rooms, menuItems] = await Promise.all([
            prisma.room.findMany({
                where: { businessId: manager.business.id },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    isAvailable: true,
                },
            }),
            prisma.menuItem.findMany({
                where: { category: { businessId: manager.business.id } },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    stock: true,
                    isAvailable: true,
                    category: { select: { name: true } },
                },
            }),
        ]);

        res.status(200).json({ rooms, menuItems });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory', error });
    }
};

// Get Low Stock Items
export const getLowStockItems = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const threshold = parseInt(req.query.threshold as string) || 10;

        // Get manager's business
        const manager = await prisma.managerProfile.findUnique({
            where: { userId },
            include: { business: true },
        });

        if (!manager || !manager.business) {
            res.status(404).json({ message: 'Business not found' });
            return;
        }

        const lowStockItems = await prisma.menuItem.findMany({
            where: {
                category: { businessId: manager.business.id },
                stock: { gt: 0, lte: threshold },
            },
            include: {
                category: { select: { name: true } },
            },
        });

        res.status(200).json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching low stock items', error });
    }
};
