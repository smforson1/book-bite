import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Create Review
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { businessId, rating, comment, images } = req.body;
        const userId = req.user.userId;

        // Check if user already reviewed this business
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_businessId: {
                    userId,
                    businessId,
                },
            },
        });

        if (existingReview) {
            res.status(400).json({ message: 'You have already reviewed this business. Use update instead.' });
            return;
        }

        const review = await prisma.review.create({
            data: {
                userId,
                businessId,
                rating,
                comment,
                images: images || [],
            },
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error });
    }
};

// Get Business Reviews
export const getBusinessReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { businessId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const reviews = await prisma.review.findMany({
            where: { businessId },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await prisma.review.count({ where: { businessId } });

        res.status(200).json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

// Get User Reviews
export const getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        const reviews = await prisma.review.findMany({
            where: { userId },
            include: {
                business: {
                    select: { name: true, type: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user reviews', error });
    }
};

// Update Review
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { rating, comment, images } = req.body;
        const userId = req.user.userId;

        // Verify ownership
        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        if (existingReview.userId !== userId) {
            res.status(403).json({ message: 'Not authorized to update this review' });
            return;
        }

        const review = await prisma.review.update({
            where: { id },
            data: {
                rating,
                comment,
                images,
            },
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error });
    }
};

// Delete Review
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Verify ownership
        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        if (existingReview.userId !== userId) {
            res.status(403).json({ message: 'Not authorized to delete this review' });
            return;
        }

        await prisma.review.delete({
            where: { id },
        });

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
};
