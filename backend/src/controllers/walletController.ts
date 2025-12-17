import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

// Get Wallet Details
export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        // Find manager profile for this user
        const manager = await prisma.managerProfile.findUnique({
            where: { userId },
        });

        if (!manager) {
            res.status(404).json({ message: 'Manager profile not found' });
            return;
        }

        // Find or create wallet
        let wallet = await prisma.wallet.findUnique({
            where: { managerId: manager.id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20 // Recent transactions
                }
            }
        });

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: { managerId: manager.id },
                include: { transactions: true }
            });
        }

        res.status(200).json(wallet);
    } catch (error) {
        console.error('Get Wallet Error', error);
        res.status(500).json({ message: 'Error fetching wallet', error });
    }
};

// Request Payout
export const requestPayout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;

        const manager = await prisma.managerProfile.findUnique({ where: { userId } });
        if (!manager) {
            res.status(404).json({ message: 'Manager not found' });
            return;
        }

        const wallet = await prisma.wallet.findUnique({ where: { managerId: manager.id } });

        if (!wallet || Number(wallet.balance) < amount) {
            res.status(400).json({ message: 'Insufficient balance' });
            return;
        }

        // Create Debit Transaction (Pending)
        // In real app, we'd also create a PayoutRequest record for Admin to review. 
        // For now, we'll deduct and mark as PENDING withdrawal.

        await prisma.$transaction([
            prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            }),
            prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amount,
                    type: 'DEBIT',
                    status: 'PENDING', // Waiting admin approval
                    description: 'Payout Request',
                }
            })
        ]);

        res.status(200).json({ message: 'Payout requested successfully' });
    } catch (error) {
        console.error('Payout Request Error', error);
        res.status(500).json({ message: 'Error requesting payout', error });
    }
};

// Admin: Get All Payouts
export const getAdminPayouts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const payouts = await prisma.walletTransaction.findMany({
            where: { type: 'DEBIT', description: 'Payout Request' }, // Filter logic
            include: {
                wallet: {
                    include: {
                        manager: {
                            include: {
                                user: {
                                    select: { name: true, email: true }
                                },
                                business: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(payouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payouts', error });
    }
};

// Admin: Process Payout
export const processPayout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // status: SUCCESS or FAILED

        const transaction = await prisma.walletTransaction.findUnique({
            where: { id },
            include: { wallet: true }
        });

        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        if (transaction.status !== 'PENDING') {
            res.status(400).json({ message: 'Transaction is not pending' });
            return;
        }

        if (status === 'SUCCESS') {
            // Confirm Payout
            await prisma.walletTransaction.update({
                where: { id },
                data: { status: 'SUCCESS' }
            });
            // Here you would trigger external bank transfer logic
        } else if (status === 'FAILED') {
            // Reject Payout - Refund Wallet
            await prisma.$transaction([
                prisma.walletTransaction.update({
                    where: { id },
                    data: {
                        status: 'FAILED',
                        description: transaction.description + (rejectionReason ? ` - Rejected: ${rejectionReason}` : ' - Rejected')
                    }
                }),
                prisma.wallet.update({
                    where: { id: transaction.walletId },
                    data: { balance: { increment: transaction.amount } }
                })
            ]);
        } else {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        res.status(200).json({ message: `Payout ${status === 'SUCCESS' ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
        console.error('Process Payout Error', error);
        res.status(500).json({ message: 'Error processing payout', error });
    }
};
