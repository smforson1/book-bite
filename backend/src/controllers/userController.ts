import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Update Push Token
export const updatePushToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const { pushToken } = req.body;

        if (!pushToken) {
            res.status(400).json({ message: 'Push token is required' });
            return;
        }

        await prisma.user.update({
            where: { id: userId },
            data: { pushToken }
        });

        res.status(200).json({ message: 'Push token updated successfully' });
    } catch (error) {
        console.error('Update Push Token Error', error);
        res.status(500).json({ message: 'Error updating push token', error });
    }
};
