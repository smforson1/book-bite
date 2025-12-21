import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Toggle Favorite (Add or Remove)
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId } = req.body;
        const userId = req.user.userId;

        // Check if favorite already exists
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_businessId: {
                    userId,
                    businessId,
                },
            },
        });

        if (existingFavorite) {
            // Remove from favorites
            await prisma.favorite.delete({
                where: { id: existingFavorite.id },
            });
            res.status(200).json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            // Add to favorites
            const favorite = await prisma.favorite.create({
                data: {
                    userId,
                    businessId,
                },
            });
            res.status(201).json({ message: 'Added to favorites', isFavorite: true, favorite });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error toggling favorite', error });
    }
};

// Get User's Favorites
export const getUserFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                business: {
                    include: {
                        reviews: {
                            select: { rating: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average rating for each business
        const favoritesWithRating = favorites.map((fav) => {
            const avgRating =
                fav.business.reviews.length > 0
                    ? fav.business.reviews.reduce((sum, r) => sum + r.rating, 0) / fav.business.reviews.length
                    : 0;
            return {
                ...fav,
                business: { ...fav.business, averageRating: avgRating },
            };
        });

        res.status(200).json(favoritesWithRating);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error });
    }
};

// Check if Business is Favorited
export const checkFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId } = req.params;
        const userId = req.user.userId;

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_businessId: {
                    userId,
                    businessId,
                },
            },
        });

        res.status(200).json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ message: 'Error checking favorite', error });
    }
};
