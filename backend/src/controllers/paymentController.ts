import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';

const prisma = new PrismaClient();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxx'; // Replace with env var

export const verifyPaymentAndGenerateCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reference, email, amount } = req.body;

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

        // 2. Generate Code
        const code = crypto.randomBytes(8).toString('hex').toUpperCase();

        // 3. Save to DB (marked automatically as paid/generated via system)
        const activationCode = await prisma.activationCode.create({
            data: {
                code,
                price: amount, // Ensure amount is decimal fitting check
                generatedBy: 'SYSTEM_PAYMENT', // Special marker
                isUsed: false
            }
        });

        res.status(200).json({
            message: 'Payment successful',
            code: activationCode.code
        });

    } catch (error) {
        console.error('Payment verification error', error);
        res.status(500).json({ message: 'Internal server error processing payment' });
    }
};
