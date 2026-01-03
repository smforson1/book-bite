import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

interface AuthRequest extends Request {
    user: { userId: string; email: string };
}

const prisma = new PrismaClient();

// Get Wallet Balance & Transactions
export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;

        let wallet = await prisma.wallet.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!wallet) {
            // Create wallet if it doesn't exist
            wallet = await prisma.wallet.create({
                data: { userId },
                include: { transactions: true }
            });
        }

        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallet', error });
    }
};

// Initialize Top Up (Paystack)
export const initializeTopUp = async (req: AuthRequest, res: Response): Promise<void> => {
    const key = (process.env.PAYSTACK_SECRET_KEY || '').trim();
    try {
        const { amount } = req.body;
        const { email, userId } = req.user;

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: Math.round(amount * 100),
                currency: 'GHS',
                metadata: {
                    purpose: 'TOP_UP',
                    userId
                }
            },
            { headers: { Authorization: `Bearer ${key}` } }
        );

        res.status(200).json(response.data.data);
    } catch (error: any) {
        res.status(500).json({ message: 'Top-up initialization failed', error: error.message });
    }
};

// Verify Top Up (Called by Frontend after success)
// Note: Real production apps use Webhooks for this. We use strict verification for now.
export const verifyTopUp = async (req: AuthRequest, res: Response): Promise<void> => {
    const key = (process.env.PAYSTACK_SECRET_KEY || '').trim();
    try {
        const { reference } = req.body;
        const userId = req.user.userId;

        // Verify with Paystack
        const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${key}` }
        });

        const data = verifyResponse.data.data;
        if (data.status !== 'success') {
            res.status(400).json({ message: 'Payment verification failed' });
            return;
        }

        // Check if transaction already processed (Idempotency)
        const existingTx = await prisma.walletTransaction.findFirst({
            where: { reference }
        });
        if (existingTx) {
            res.status(200).json({ message: 'Transaction already processed' });
            return;
        }

        // Credit Wallet
        const amount = data.amount / 100;

        let wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            wallet = await prisma.wallet.create({ data: { userId } });
        }

        await prisma.$transaction([
            prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
            }),
            prisma.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: 'CREDIT',
                    status: 'SUCCESS',
                    description: 'Wallet Top Up',
                    reference
                }
            }),
            // Track as global Payment too for analytics
            prisma.payment.create({
                data: {
                    userId,
                    amount,
                    currency: data.currency,
                    status: 'SUCCESS',
                    purpose: 'TOP_UP',
                    reference,
                    metadata: data.metadata
                }
            })
        ]);

        res.status(200).json({ message: 'Wallet credited successfully', balance: Number(wallet.balance) + amount });

    } catch (error: any) {
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};

// Pay with Wallet
export const payWithWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, purpose, metadata } = req.body; // purpose: BOOKING | ORDER
        const userId = req.user.userId;

        const wallet = await prisma.wallet.findUnique({ where: { userId } });

        if (!wallet || Number(wallet.balance) < amount) {
            res.status(400).json({ message: 'Insufficient wallet balance' });
            return;
        }

        // Process Deduction
        await prisma.$transaction(async (tx) => {
            // 1. Debit User Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: 'DEBIT',
                    status: 'SUCCESS',
                    description: `Payment for ${purpose}`,
                    reference: `WAL-${Date.now()}`
                }
            });

            // 2. Create Payment Record (Internal)
            const payment = await tx.payment.create({
                data: {
                    userId,
                    amount,
                    currency: wallet.currency,
                    status: 'SUCCESS',
                    purpose, // BOOKING or ORDER
                    reference: `WAL-${Date.now()}`, // Internal Ref
                    metadata
                }
            });

            // 3. Update Booking or Order status AND credit manager
            if (purpose === 'BOOKING' && metadata.bookingId) {
                const booking = await tx.booking.update({
                    where: { id: metadata.bookingId },
                    data: {
                        status: 'CONFIRMED',
                        payments: { connect: { id: payment.id } },
                        paidAmount: { increment: amount }
                    },
                    include: { business: { include: { manager: true } } }
                });

                // Credit Manager
                if (booking.business?.manager?.userId) {
                    const managerUserId = booking.business.manager.userId;
                    let managerWallet = await tx.wallet.findUnique({ where: { userId: managerUserId } });
                    if (!managerWallet) {
                        managerWallet = await tx.wallet.create({ data: { userId: managerUserId } });
                    }

                    await tx.wallet.update({
                        where: { id: managerWallet.id },
                        data: { balance: { increment: amount } }
                    });

                    await tx.walletTransaction.create({
                        data: {
                            walletId: managerWallet.id,
                            amount,
                            type: 'CREDIT',
                            status: 'SUCCESS',
                            description: `Booking Revenue #${booking.id.slice(0, 8)}...`,
                            reference: payment.reference
                        }
                    });
                }
            } else if (purpose === 'ORDER' && metadata.orderId) {
                const order = await tx.order.update({
                    where: { id: metadata.orderId },
                    data: { status: 'CONFIRMED', paymentId: payment.id },
                    include: { business: { include: { manager: true } } }
                });

                // Credit Manager
                if (order.business?.manager?.userId) {
                    const managerUserId = order.business.manager.userId;
                    let managerWallet = await tx.wallet.findUnique({ where: { userId: managerUserId } });
                    if (!managerWallet) {
                        managerWallet = await tx.wallet.create({ data: { userId: managerUserId } });
                    }

                    await tx.wallet.update({
                        where: { id: managerWallet.id },
                        data: { balance: { increment: amount } }
                    });

                    await tx.walletTransaction.create({
                        data: {
                            walletId: managerWallet.id,
                            amount,
                            type: 'CREDIT',
                            status: 'SUCCESS',
                            description: `Order Revenue #${order.id.slice(0, 8)}...`,
                            reference: payment.reference
                        }
                    });
                }
            }
        });

        res.status(200).json({ message: 'Payment successful' });

    } catch (error: any) {
        res.status(500).json({ message: 'Wallet payment failed', error: error.message });
    }
};
