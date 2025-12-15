import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Menu Item
export const createMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryId, name, description, price, images, dietaryTags } = req.body;
        const userId = req.user.userId;

        // Verify category ownership
        const category = await prisma.menuCategory.findFirst({
            where: {
                id: categoryId,
                business: { manager: { userId } },
            },
        });

        if (!category) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                categoryId,
                name,
                description,
                price: parseFloat(price),
                images: images || [],
                dietaryTags: dietaryTags || [],
            },
        });

        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error });
    }
};

// Get Menu Items by Business
export const getMenuItemsByBusiness = async (req: Request, res: Response): Promise<void> => {
    try {
        const { businessId } = req.params;

        const categories = await prisma.menuCategory.findMany({
            where: { businessId },
            include: {
                items: true,
            },
            orderBy: { name: 'asc' },
        });

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error });
    }
};

// Create Menu Category
export const createMenuCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId, name } = req.body;
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

        const category = await prisma.menuCategory.create({
            data: { businessId, name },
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};

// Update Menu Item
export const updateMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price, images, dietaryTags, isAvailable } = req.body;
        const userId = req.user.userId;

        // Verify ownership
        const menuItem = await prisma.menuItem.findFirst({
            where: {
                id,
                category: { business: { manager: { userId } } },
            },
        });

        if (!menuItem) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const updated = await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                images,
                dietaryTags,
                isAvailable,
            },
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
};

// Delete Menu Item
export const deleteMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Verify ownership
        const menuItem = await prisma.menuItem.findFirst({
            where: {
                id,
                category: { business: { manager: { userId } } },
            },
        });

        if (!menuItem) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        await prisma.menuItem.delete({ where: { id } });
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error });
    }
};
