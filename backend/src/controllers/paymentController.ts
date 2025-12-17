import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';

const prisma = new PrismaClient();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxx'; // Replace with env var

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reference, email, amount, metadata } = req.body;
        // metadata should contain: { purpose: 'ACCESS_KEY' | 'BOOKING' | 'ORDER', userId: string, bookingId?: string, orderId?: string }

        // 1. Verify Payment with Paystack
        const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        });

        const data = verifyResponse.data.data;

        if (data.status !== 'success') {
            res.status(400).json({ message: 'Payment verification failed' });
            return;
        }

        const purpose = metadata?.purpose || 'ACCESS_KEY'; // Default for backward compatibility if needed, though Access Key flow should send it.
        const userId = metadata?.userId;

        // 2. Create Payment Record
        const payment = await prisma.payment.create({
            data: {
                reference,
                amount: data.amount / 100, // Paystack amount is in kobo/cents
                currency: data.currency,
                status: data.status,
                purpose,
                userId: userId, // Assuming userId is passed or we can find it via email if strictly needed, but ID is safer
                metadata: data.metadata || {},
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

            // Credit Wallet
            if (booking.business?.manager?.id) {
                const managerId = booking.business.manager.id;
                // Upsert wallet just in case
                let wallet = await prisma.wallet.findUnique({ where: { managerId } });
                if (!wallet) {
                    wallet = await prisma.wallet.create({ data: { managerId } });
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
                include: { business: { include: { manager: true } } }
            });

            // Credit Wallet
            if (order.business?.manager?.id) {
                const managerId = order.business.manager.id;
                // Upsert wallet
                let wallet = await prisma.wallet.findUnique({ where: { managerId } });
                if (!wallet) {
                    wallet = await prisma.wallet.create({ data: { managerId } });
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
            }
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Payment verification error', error);
        res.status(500).json({ message: 'Internal server error processing payment' });
    }
};
