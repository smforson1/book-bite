import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';
import { sendPushNotification } from '../services/notificationService';

const prisma = new PrismaClient();

export const initializePayment = async (req: Request, res: Response): Promise<void> => {
    const key = (process.env.PAYSTACK_SECRET_KEY || '').trim();
    try {
        const { email, amount, metadata } = req.body;

        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: Math.round(amount * 100), // Convert to pesewas/kobo
                currency: 'GHS',
                callback_url: 'https://standard.paystack.co/close',
                metadata
            },
            {
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json(response.data.data);
    } catch (error: any) {
        console.error('Payment initialization error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Failed to initialize payment',
            error: error.response?.data?.message || error.message
        });
    }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    const key = (process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxx').trim();
    try {
        const { reference, email, amount, metadata } = req.body;
        // metadata should contain: { purpose: 'ACCESS_KEY' | 'BOOKING' | 'ORDER', userId: string, bookingId?: string, orderId?: string }

        // 1. Verify Payment with Paystack
        const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${key}`
            }
        });

        const data = verifyResponse.data.data;

        if (data.status !== 'success') {
            res.status(400).json({ message: 'Payment verification failed' });
            return;
        }

        const purpose = metadata?.purpose || data.metadata?.purpose || 'ACCESS_KEY';
        const userId = metadata?.userId || data.metadata?.userId;

        // 2. Create or Update Payment Record (Idempotent)
        const payment = await prisma.payment.upsert({
            where: { reference },
            update: {
                status: data.status,
                metadata: data.metadata || metadata || {},
            },
            create: {
                reference,
                amount: data.amount / 100,
                currency: data.currency,
                status: data.status,
                purpose,
                userId: userId,
                metadata: data.metadata || metadata || {},
            }
        });

        // 3. Handle specific purpose logic
        let responseData: any = { message: 'Payment verified successfully' };

        if (purpose === 'ACCESS_KEY') {
            // Existing logic: Generate Code
            const code = crypto.randomBytes(8).toString('hex').toUpperCase();

            await prisma.activationCode.create({
                data: {
                    code,
                    price: amount,
                    generatedBy: 'SYSTEM_PAYMENT',
                    isUsed: false
                }
            });

            responseData = { ...responseData, code };

        } else if (purpose === 'BOOKING' && metadata.bookingId) {
            // Update Booking & Credit Wallet
            const booking = await prisma.booking.update({
                where: { id: metadata.bookingId },
                data: {
                    status: 'CONFIRMED',
                    paymentId: payment.id
                },
                include: { business: { include: { manager: true } } }
            });

            // Credit Wallet (Manager's User Wallet)
            if (booking.business?.manager?.userId) {
                const userId = booking.business.manager.userId;
                // Upsert wallet just in case
                let wallet = await prisma.wallet.findUnique({ where: { userId } });
                if (!wallet) {
                    wallet = await prisma.wallet.create({ data: { userId } });
                }

                await prisma.$transaction([
                    prisma.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: { increment: payment.amount } }
                    }),
                    prisma.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            amount: payment.amount,
                            type: 'CREDIT',
                            status: 'SUCCESS',
                            reference: payment.reference,
                            description: `Booking Revenue #${booking.id.slice(0, 8)}...`
                        }
                    })
                ]);
            }

        } else if (purpose === 'ORDER' && metadata.orderId) {
            // Update Order & Credit Wallet
            const order = await prisma.order.update({
                where: { id: metadata.orderId },
                data: {
                    status: 'CONFIRMED', // Or whatever initial paid status is
                    paymentId: payment.id
                },
                include: { business: { include: { manager: { include: { user: true } } } } }
            });

            // Credit Wallet (Manager's User Wallet)
            if (order.business?.manager?.userId) {
                const userId = order.business.manager.userId;
                // Upsert wallet
                let wallet = await prisma.wallet.findUnique({ where: { userId } });
                if (!wallet) {
                    wallet = await prisma.wallet.create({ data: { userId } });
                }

                await prisma.$transaction([
                    prisma.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: { increment: payment.amount } }
                    }),
                    prisma.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            amount: payment.amount,
                            type: 'CREDIT',
                            status: 'SUCCESS',
                            reference: payment.reference,
                            description: `Order Revenue #${order.id.slice(0, 8)}...`
                        }
                    })
                ]);

                // Send Notification to Manager
                if (order.business?.manager?.userId) {
                    await sendPushNotification({
                        userId: order.business.manager.userId,
                        title: 'New Order Received! 🍔',
                        body: `Order #${order.id.slice(0, 5)} has been paid and confirmed.`,
                        data: { orderId: order.id, screen: 'OrderDetails' },
                    });
                }
            }
        }

        res.status(200).json(responseData);

    } catch (error: any) {
        console.error('Payment verification error:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Internal server error processing payment',
            error: error.response?.data?.message || error.message
        });
    }
};
